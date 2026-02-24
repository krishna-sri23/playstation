# PlayStation Chat App - Architecture Overview

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        Browser["Web Browser"]
        CLIChat["CLI Client\ninteractive-chat.cjs"]
    end

    subgraph Server["Node.js Server (Port 3000)"]
        subgraph EntryPoint["Entry Point - src/index.js"]
            Express["Express App"]
            HTTPServer["HTTP Server"]
            SocketIO["Socket.IO Server"]
        end

        subgraph Middleware["Middleware Layer"]
            CORS["cors()"]
            JSONParser["express.json()"]
            ErrHandler["errorHandler"]
        end

        subgraph REST["REST API Layer"]
            Routes["routes/index.js"]
            UserRoutes["userRoutes.js"]
            ChatRoutes["chatRoutes.js"]
            UserCtrl["userController.js"]
            ChatCtrl["chatController.js"]
        end

        subgraph WebSocket["WebSocket Layer"]
            SocketHandler["socket/index.js"]
            UserSocketMap["userSocketMap<br/>userId --> socketId"]
            PersonalRooms["Personal Rooms<br/>user:{id}"]
            ChatRooms["Chat Rooms<br/>chat:{sessionId}"]
        end

        subgraph Services["Service Layer"]
            UserSvc["userService.js"]
            ChatSvc["chatService.js"]
        end

        subgraph Models["Data Model Layer"]
            ModelIndex["models/index.js<br/>(Associations)"]
            UserModel["User"]
            ChatModel["Chat"]
            MsgModel["Message"]
        end

        subgraph Config["Configuration"]
            DBConfig["config/db.js<br/>Sequelize"]
            RedisConfig["config/redis.js<br/>Redis Client"]
        end
    end

    subgraph DataStores["Data Stores (Docker)"]
        MySQL[("MySQL 8.0\nplaystation-mysql\nPort 3306\n\nPersistent Storage:\n- Users\n- Closed Chats\n- Message History")]
        Redis[("Redis 7\nplaystation-redis\nPort 6379\n\nIn-Memory:\n- User Profile Cache\n- Active Chat Sessions\n- Live Messages")]
    end

    %% Client connections
    Browser -- "HTTP REST" --> Express
    Browser -- "WebSocket" --> SocketIO
    CLIChat -- "WebSocket" --> SocketIO

    %% Middleware flow
    Express --> CORS --> JSONParser --> Routes
    Routes --> UserRoutes --> UserCtrl
    Routes --> ChatRoutes --> ChatCtrl

    %% Socket flow
    SocketIO --> SocketHandler
    SocketHandler --> UserSocketMap
    SocketHandler --> PersonalRooms
    SocketHandler --> ChatRooms

    %% Controller/Socket to Services
    UserCtrl --> UserSvc
    ChatCtrl --> ChatSvc
    SocketHandler --> ChatSvc

    %% Services to Models
    UserSvc --> UserModel
    ChatSvc --> UserModel
    ChatSvc --> ChatModel
    ChatSvc --> MsgModel

    %% Error handling
    UserCtrl -. "next(error)" .-> ErrHandler
    ChatCtrl -. "next(error)" .-> ErrHandler

    %% Config to data stores
    DBConfig --> MySQL
    RedisConfig --> Redis

    %% Services to data stores
    UserSvc -- "CRUD + bcrypt" --> MySQL
    UserSvc -- "Profile cache\nTTL: 1hr" --> Redis
    ChatSvc -- "Chat records\nMessage history" --> MySQL
    ChatSvc -- "Active sessions\nLive messages" --> Redis
```

## Data Flow: Dual-Storage Pattern

```mermaid
flowchart LR
    subgraph ActiveChat["Active Chat (Real-Time)"]
        direction TB
        A1["Client sends message"] --> A2["Socket.IO: send-message"]
        A2 --> A3["chatService.sendMessage()"]
        A3 --> A4["Redis rPush\nchat:{sessionId}:messages"]
        A4 --> A5["Broadcast to chat room\nreceive-message event"]
    end

    subgraph FlushPhase["Chat Ends (Flush)"]
        direction TB
        F1["Client emits end-chat"] --> F2["chatService.endChat()"]
        F2 --> F3["Redis lRange\nGet all messages"]
        F3 --> F4["Message.bulkCreate()\nWrite to MySQL"]
        F4 --> F5["Chat.update\nstatus: closed"]
        F5 --> F6["Redis del\nClean up keys"]
    end

    subgraph HistoryQuery["History (REST API)"]
        direction TB
        H1["GET /api/chats/:chatId/history"] --> H2["chatController.getChatHistory()"]
        H2 --> H3["chatService.getChatHistory()"]
        H3 --> H4["Message.findAll()\nFrom MySQL"]
        H4 --> H5["Return messages\nwith sender info"]
    end

    ActiveChat --> FlushPhase --> HistoryQuery
```

## Module Dependency Graph

```mermaid
flowchart TD
    index["src/index.js"]

    index --> dotenv["dotenv/config"]
    index --> express["express"]
    index --> http["http"]
    index --> cors["cors"]
    index --> dbConfig["config/db.js"]
    index --> redisConfig["config/redis.js"]
    index --> errorHandler["middlewares/errorHandler.js"]
    index --> modelsIndex["models/index.js"]
    index --> routesIndex["routes/index.js"]
    index --> socketIndex["socket/index.js"]

    modelsIndex --> userModel["models/user.js"]
    modelsIndex --> chatModel["models/chat.js"]
    modelsIndex --> messageModel["models/message.js"]
    userModel --> dbConfig
    chatModel --> dbConfig
    chatModel --> uuid["uuid"]
    messageModel --> dbConfig

    routesIndex --> userRoutes["routes/userRoutes.js"]
    routesIndex --> chatRoutes["routes/chatRoutes.js"]
    userRoutes --> userCtrl["controllers/userController.js"]
    chatRoutes --> chatCtrl["controllers/chatController.js"]

    userCtrl --> userSvc["services/userService.js"]
    userCtrl --> errorHandler
    chatCtrl --> chatSvc["services/chatService.js"]

    userSvc --> modelsIndex
    userSvc --> errorHandler
    userSvc --> bcrypt["bcrypt"]
    userSvc --> redisConfig

    chatSvc --> modelsIndex
    chatSvc --> redisConfig
    chatSvc --> sequelizeOp["sequelize Op"]

    socketIndex --> chatSvc
    socketIndex --> socketIO["socket.io"]

    style index fill:#e67e22,color:#fff
    style dbConfig fill:#3498db,color:#fff
    style redisConfig fill:#e74c3c,color:#fff
    style modelsIndex fill:#f39c12,color:#fff
    style routesIndex fill:#2ecc71,color:#fff
    style socketIndex fill:#9b59b6,color:#fff
    style userSvc fill:#1abc9c,color:#fff
    style chatSvc fill:#1abc9c,color:#fff
```

## Folder Index

| Diagram | File | Description |
|---------|------|-------------|
| **This file** | `diagrams/architecture-overview.md` | High-level architecture, data flow, module dependencies |
| **Models** | `diagrams/models/entity-relationship.md` | ER diagram with all table schemas |
| **Models** | `diagrams/models/model-classes.md` | Class diagram of Sequelize models |
| **Controllers** | `diagrams/controllers/controllers.md` | Request handling flows for user & chat controllers |
| **Services** | `diagrams/services/services.md` | Business logic flowcharts for userService & chatService |
| **Routes** | `diagrams/routes/routes.md` | API endpoint tree and full endpoint reference |
| **Socket** | `diagrams/socket/socket-events.md` | All Socket.IO event sequence diagrams and room structure |
| **Config** | `diagrams/config/config.md` | Database & Redis configuration and connection lifecycle |
| **Middleware** | `diagrams/middleware/middleware.md` | Express middleware pipeline and error handling flow |
| **Infrastructure** | `diagrams/infrastructure/infrastructure.md` | Docker Compose, startup sequence, network topology |
