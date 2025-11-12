<!--
    EduLearn - Complete Mermaid Diagram Suite
    This file contains all architectural diagrams for the EduLearn LMS Project
    Generated: November 11, 2025
-->

# EduLearn System Architecture Diagrams

## 1. COMPLETE SYSTEM ARCHITECTURE

```mermaid
graph TB
    subgraph Users["👥 USERS & ROLES"]
        Student["👨‍🎓 Students<br/>Browse & Learn"]
        Instructor["👨‍🏫 Instructors<br/>Create & Manage"]
        Admin["🔧 Admins<br/>System Control"]
    end

    subgraph ClientLayer["📱 CLIENT LAYER<br/>eduLearn Mobile App"]
        direction TB
        iOS["iOS App<br/>Expo Runtime"]
        Android["Android App<br/>React Native"]
        Web["Web Interface<br/>React Native Web"]

        Screens["Screens Layer<br/>Auth | Courses | Quiz | Profile"]
        Components["Components Layer<br/>Cards | Forms | Lists | Modals"]
    end

    subgraph StateManagement["🎨 STATE & CONTEXT"]
        AuthCtx["AuthContext<br/>User | Token | Auth State"]
        ThemeCtx["ThemeContext<br/>Dark/Light Mode"]
        LocalStorage["AsyncStorage<br/>Persistent Cache"]
    end

    subgraph Services["🔌 API INTEGRATION"]
        Axios["Axios HTTP Client<br/>Interceptors | Error Handling"]
        AuthSvc["AuthService<br/>Login | Register | Logout"]
        CourseSvc["CourseService<br/>Fetch | Enroll | Search"]
        QuizSvc["QuizService<br/>Get | Submit | Grade"]
        ProfileSvc["ProfileService<br/>Update | Progress"]
    end

    subgraph NetworkLayer["🌐 NETWORK TRANSPORT"]
        HTTPS["HTTPS/TLS<br/>Encrypted Connection"]
        JWT["JWT Authentication<br/>Authorization Header"]
    end

    subgraph APIGateway["🔗 API GATEWAY"]
        Gateway["Django WSGI Server<br/>Request Router<br/>Response Formatter"]
    end

    subgraph BackendLayer["🔧 BACKEND<br/>Django REST Framework"]
        direction TB

        subgraph Auth["🔐 Auth Module"]
            AuthView["RegisterView<br/>LoginView<br/>LogoutView"]
            AuthPerm["JWT Handler<br/>Token Generation<br/>Token Validation"]
        end

        subgraph Courses["📚 Courses Module"]
            CourseView["CourseViewSet<br/>CRUD Operations"]
            EnrollView["EnrollmentViewSet<br/>Enrollment Management"]
            ProgressView["ProgressViewSet<br/>Track Learning"]
        end

        subgraph Quiz["🎯 Quiz Module"]
            QuizView["QuizViewSet<br/>Quiz Management"]
            QuestionView["QuestionViewSet<br/>Content Management"]
            SubmitView["StudentAnswerViewSet<br/>Answer Submission"]
        end
    end

    subgraph Middleware["⚙️ MIDDLEWARE & SECURITY"]
        JWTAuth["JWT Authentication<br/>Token Verification<br/>Auto Refresh"]
        CORSPolicy["CORS Policy<br/>Origin Validation<br/>Method Filtering"]
        Permissions["Permission Classes<br/>IsAuthenticated<br/>IsInstructor<br/>IsAdmin"]
        Validation["Input Validation<br/>Serializers<br/>Schema Check"]
    end

    subgraph Models["📊 DATA MODELS"]
        direction TB
        UserMdl["CustomUser<br/>id | username | email<br/>role | password_hash"]
        CourseMdl["Course<br/>id | title | description<br/>instructor_id | created_at"]
        EnrollMdl["Enrollment<br/>id | student_id | course_id<br/>enrolled_at | unique"]
        ProgressMdl["Progress<br/>id | student_id | course_id<br/>completed | total | score"]
        QuizMdl["Quiz<br/>id | course_id | title<br/>time_limit | created_at"]
        QuestionMdl["Question<br/>id | quiz_id | text"]
        OptionMdl["Option<br/>id | question_id | text<br/>is_correct"]
        AnswerMdl["StudentAnswer<br/>id | student_id | question_id<br/>selected_option_id | submitted_at"]
    end

    subgraph Database["💾 DATABASE LAYER"]
        ProdDB["PostgreSQL<br/>Production Database<br/>Optimized Queries<br/>Indexes & Relations"]
        DevDB["SQLite<br/>Development Database<br/>Quick Testing"]
    end

    %% Connections
    Users -->|Access| ClientLayer

    iOS -->|React Native| Screens
    Android -->|React Native| Screens
    Web -->|React Native Web| Screens

    Screens -->|State| Components
    Components -->|Updates State| StateManagement

    AuthCtx -->|Token| LocalStorage
    ThemeCtx -->|Theme| LocalStorage

    Screens -->|Call| Services
    Services -->|HTTP Request| Axios
    Axios -->|Add Headers| JWT
    JWT -->|Encrypted| HTTPS

    HTTPS -->|Request| Gateway
    Gateway -->|Route| Auth
    Gateway -->|Route| Courses
    Gateway -->|Route| Quiz

    Auth -->|Validate| JWTAuth
    Courses -->|Check| Permissions
    Quiz -->|Check| Permissions

    JWTAuth -->|Verify| CORSPolicy
    CORSPolicy -->|Validate Input| Validation

    Auth -->|Query/Update| UserMdl
    Courses -->|Query/Update| CourseMdl
    Courses -->|Query/Update| EnrollMdl
    Courses -->|Query/Update| ProgressMdl
    Quiz -->|Query/Update| QuizMdl
    Quiz -->|Query/Update| QuestionMdl
    Quiz -->|Query/Update| OptionMdl
    Quiz -->|Query/Update| AnswerMdl

    UserMdl -->|Store| ProdDB
    CourseMdl -->|Store| ProdDB
    EnrollMdl -->|Store| ProdDB
    ProgressMdl -->|Store| ProdDB
    QuizMdl -->|Store| ProdDB
    QuestionMdl -->|Store| ProdDB
    OptionMdl -->|Store| ProdDB
    AnswerMdl -->|Store| ProdDB

    %% Styling
    classDef userStyle fill:#bbdefb,stroke:#1976d2,stroke-width:2px
    classDef clientStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef stateStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef serviceStyle fill:#e0f2f1,stroke:#00796b,stroke-width:2px
    classDef networkStyle fill:#ffe0b2,stroke:#e65100,stroke-width:2px
    classDef backendStyle fill:#ffccbc,stroke:#d84315,stroke-width:2px
    classDef dbStyle fill:#c8e6c9,stroke:#388e3c,stroke-width:2px

    class Users userStyle
    class ClientLayer,Screens,Components clientStyle
    class StateManagement stateStyle
    class Services,Axios serviceStyle
    class HTTPS,JWT networkStyle
    class BackendLayer,Auth,Courses,Quiz backendStyle
    class Database,ProdDB,DevDB dbStyle
```

---

## 2. DETAILED REQUEST-RESPONSE CYCLE

```mermaid
sequenceDiagram
    participant UI as 📱 User Interface
    participant Context as 🎨 React Context
    participant Service as 🔌 API Service
    participant Axios as 📡 Axios Client
    participant Middleware as ⚙️ Middleware
    participant View as 👀 Django View
    participant Serializer as ✓ Serializer
    participant Model as 📊 Model
    participant DB as 💾 Database

    UI->>UI: User Action<br/>(e.g., Login)

    UI->>Service: Call Service Method<br/>login(email, password)

    Service->>Service: Build Request Data<br/>{email, password}

    Service->>Axios: POST /auth/login<br/>with credentials

    Axios->>Axios: Add Headers<br/>Content-Type: JSON<br/>CORS headers

    Axios->>Middleware: Send Request<br/>HTTPS Encrypted

    Middleware->>Middleware: Check CORS<br/>Validate Origin

    Middleware->>View: Route to LoginView<br/>extract data

    View->>Serializer: Deserialize &<br/>Validate Input

    Serializer->>Serializer: Type Check<br/>Field Validation<br/>Length Validation

    Serializer->>Model: Query CustomUser<br/>filter(email=email)

    Model->>DB: SELECT * FROM<br/>CustomUser WHERE email=?

    DB-->>Model: User Record<br/>(if exists)

    Model-->>View: User Object

    View->>View: Check Password<br/>hash comparison

    alt Password Correct
        View->>View: Generate JWT Token<br/>access_token +<br/>refresh_token

        View->>Serializer: Serialize Response<br/>{token, user}

        Serializer->>Axios: Return 200 OK<br/>with tokens

        Axios->>Service: Response Data

        Service->>Context: Update AuthContext<br/>user, token,<br/>isAuthenticated=true

        Context->>UI: Trigger Re-render<br/>Navigate to Home

        UI-->>UI: ✅ Success<br/>Show Home Screen
    else Password Incorrect
        View->>Axios: Return 401<br/>Unauthorized

        Axios->>Service: Error Response

        Service->>Context: Set Error State

        Context->>UI: Show Error Message

        UI-->>UI: ❌ Failed Login
    end
```

---

## 3. DATABASE SCHEMA - RELATIONSHIP DIAGRAM

```mermaid
erDiagram
    CUSTOM_USER ||--o{ COURSE : "creates"
    CUSTOM_USER ||--o{ ENROLLMENT : "enrolls in"
    CUSTOM_USER ||--o{ PROGRESS : "tracks"
    CUSTOM_USER ||--o{ STUDENT_ANSWER : "submits"

    COURSE ||--o{ ENROLLMENT : "has"
    COURSE ||--o{ QUIZ : "contains"
    COURSE ||--o{ PROGRESS : "monitors"

    QUIZ ||--o{ QUESTION : "includes"

    QUESTION ||--o{ OPTION : "has"
    QUESTION ||--o{ STUDENT_ANSWER : "answered"

    OPTION ||--o{ STUDENT_ANSWER : "selected"

    CUSTOM_USER {
        int id PK "Primary Key"
        string username UK "Unique Constraint"
        string email UK "Unique Constraint"
        string password_hash "Hashed Password"
        string first_name
        string last_name
        string role "student|instructor|admin"
        boolean is_active "Account Status"
        datetime created_at "Creation Timestamp"
        datetime updated_at "Last Update"
    }

    COURSE {
        int id PK
        string title "Course Name"
        text description "Course Description"
        int instructor_id FK "References CUSTOM_USER"
        datetime created_at
        datetime updated_at
        text course_content "Rich Content"
    }

    ENROLLMENT {
        int id PK
        int student_id FK "References CUSTOM_USER"
        int course_id FK "References COURSE"
        datetime enrolled_at "Enrollment Time"
    }

    PROGRESS {
        int id PK
        int student_id FK "References CUSTOM_USER"
        int course_id FK "References COURSE"
        int completed_lessons "Completed Count"
        int total_lessons "Total Count"
        float score "Current Score"
    }

    QUIZ {
        int id PK
        int course_id FK "References COURSE"
        string title "Quiz Name"
        int time_limit "In Minutes"
        datetime created_at
    }

    QUESTION {
        int id PK
        int quiz_id FK "References QUIZ"
        string text "Question Text"
        datetime created_at
    }

    OPTION {
        int id PK
        int question_id FK "References QUESTION"
        string text "Option Text"
        boolean is_correct "Answer Flag"
    }

    STUDENT_ANSWER {
        int id PK
        int student_id FK "References CUSTOM_USER"
        int question_id FK "References QUESTION"
        int selected_option_id FK "References OPTION"
        datetime submitted_at
    }
```

---

## 4. AUTHENTICATION & SECURITY FLOW

```mermaid
graph TD
    Start["User Requests<br/>Protected Resource"]

    Start -->|1. Check Header| HeaderExist{Authorization<br/>Header<br/>Exists?}

    HeaderExist -->|No| Missing["Return 401<br/>Missing Credentials"]

    HeaderExist -->|Yes| Extract["2. Extract Token<br/>from Header"]

    Extract -->|3. Decode| JWTDecode{"Valid JWT<br/>Signature?"}

    JWTDecode -->|No| InvalidSig["Return 401<br/>Invalid Token"]

    JWTDecode -->|Yes| CheckExp{"Token<br/>Expired?"}

    CheckExp -->|Yes| Expired["Return 401<br/>Token Expired"]

    CheckExp -->|No| QueryUser["4. Query User<br/>from Database"]

    QueryUser -->|User Exists| CheckActive{"User<br/>Active?"}

    QueryUser -->|Not Found| NotFound["Return 401<br/>User Not Found"]

    CheckActive -->|No| Inactive["Return 403<br/>Account Disabled"]

    CheckActive -->|Yes| CheckPerm{"Permission<br/>Allowed?"}

    CheckPerm -->|No| Forbidden["Return 403<br/>Forbidden"]

    CheckPerm -->|Yes| AllowRequest["5. ✅ Allow Request<br/>Proceed to View"]

    AllowRequest -->|6. Execute| View["Process View<br/>Logic"]

    View -->|7. Return| Success["200 OK<br/>with Data"]

    style Start fill:#bbdefb
    style Missing fill:#ffccbc
    style InvalidSig fill:#ffccbc
    style Expired fill:#ffccbc
    style NotFound fill:#ffccbc
    style Inactive fill:#ffccbc
    style Forbidden fill:#ffccbc
    style AllowRequest fill:#c8e6c9
    style View fill:#c8e6c9
    style Success fill:#c8e6c9
```

---

## 5. COURSE ENROLLMENT WORKFLOW

```mermaid
graph LR
    subgraph Student["👨‍🎓 Student Actions"]
        Browse["Browse<br/>Courses"]
        Select["Select<br/>Course"]
        Click["Click<br/>Enroll"]
    end

    subgraph Frontend["📱 Frontend Process"]
        Validate["Validate<br/>User Auth"]
        Build["Build<br/>Request"]
        Call["Call API"]
    end

    subgraph Backend["🔧 Backend Process"]
        Auth["Verify JWT<br/>Token"]
        CheckDup["Check<br/>Duplicate"]
        Create["Create<br/>Enrollment"]
        Update["Update<br/>Progress"]
    end

    subgraph Database["💾 Database"]
        Insert["INSERT INTO<br/>enrollment"]
        Fetch["SELECT course<br/>details"]
    end

    subgraph Response["📡 Response"]
        Success["Return<br/>Success"]
        Update_UI["Update UI<br/>Show Enrolled"]
        Navigate["Navigate to<br/>Course"]
    end

    Browse -->|1| Select
    Select -->|2| Click
    Click -->|3| Validate
    Validate -->|4| Build
    Build -->|5| Call
    Call -->|6 POST /enrollments| Auth
    Auth -->|7| CheckDup
    CheckDup -->|8 Check Unique| Fetch
    Fetch -->|Data| CheckDup
    CheckDup -->|9 No Duplicate| Create
    Create -->|10 INSERT| Insert
    Insert -->|11| Update
    Update -->|12| Success
    Success -->|13 JSON Response| Update_UI
    Update_UI -->|14| Navigate

    style Student fill:#bbdefb
    style Frontend fill:#f3e5f5
    style Backend fill:#fff3e0
    style Database fill:#e8f5e9
    style Response fill:#c8e6c9
    style Success fill:#a5d6a7
```

---

## 6. QUIZ SUBMISSION & GRADING

```mermaid
graph TB
    subgraph Quiz["🎯 Quiz Attempt"]
        Start["Quiz Starts"]
        Display["Display Q1"]
        Answer["Student<br/>Selects Answer"]
        Next["Move to Q2"]
        Time["⏱️ Timer<br/>Countdown"]
    end

    subgraph Validation["✓ Validation"]
        Timeout{"Time<br/>Expired?"}
        AllDone{"All Q<br/>Done?"}
    end

    subgraph Submit["📤 Submit Phase"]
        AutoSub["Auto Submit"]
        ManualSub["Manual Submit"]
        Package["Package Answers<br/>{Q1:Opt1, Q2:Opt2...}"]
    end

    subgraph Backend["🔧 Backend Grading"]
        Receive["Receive<br/>Answers"]
        Process["Process<br/>Each Answer"]
        Compare["Compare to<br/>Correct Answers"]
        Calculate["Calculate<br/>Score"]
        Store["Store<br/>StudentAnswers"]
        Update["Update<br/>Progress"]
    end

    subgraph Response["📡 Response & UI"]
        Return["Return Score<br/>& Results"]
        Show["Show Results<br/>Screen"]
        Detail["Show Correct/<br/>Incorrect"]
    end

    Start --> Display
    Display --> Answer
    Answer --> Next
    Next --> Display
    Display --> Time
    Time --> Timeout
    Timeout -->|No| AllDone
    Timeout -->|Yes| AutoSub
    AllDone -->|No| Display
    AllDone -->|Yes| ManualSub
    Answer -->|Manual| ManualSub
    AutoSub --> Package
    ManualSub --> Package
    Package -->|POST /submit-quiz| Receive
    Receive --> Process
    Process --> Compare
    Compare --> Calculate
    Calculate --> Store
    Store --> Update
    Update --> Return
    Return --> Show
    Show --> Detail

    style Quiz fill:#e3f2fd
    style Validation fill:#fff3e0
    style Submit fill:#f3e5f5
    style Backend fill:#fff3e0
    style Response fill:#e8f5e9
```

---

## 7. USER ROLES & PERMISSIONS

```mermaid
graph TB
    subgraph Roles["👥 USER ROLES"]
        Student["👨‍🎓<br/>STUDENT"]
        Instructor["👨‍🏫<br/>INSTRUCTOR"]
        Admin["🔧<br/>ADMIN"]
    end

    subgraph StudentPerms["📋 Student Permissions"]
        S1["✓ View Courses"]
        S2["✓ Enroll in Courses"]
        S3["✓ Take Quizzes"]
        S4["✓ View Progress"]
        S5["✓ Update Profile"]
        S6["✗ Create Courses"]
        S7["✗ Grade Quizzes"]
    end

    subgraph InstructorPerms["📋 Instructor Permissions"]
        I1["✓ Create Courses"]
        I2["✓ Manage Courses"]
        I3["✓ Create Quizzes"]
        I4["✓ View Student Progress"]
        I5["✓ Grade Assignments"]
        I6["✓ Update Profile"]
        I7["✗ Manage Users"]
        I8["✗ System Settings"]
    end

    subgraph AdminPerms["📋 Admin Permissions"]
        A1["✓ Manage All Users"]
        A2["✓ Approve Courses"]
        A3["✓ View Analytics"]
        A4["✓ System Configuration"]
        A5["✓ View All Data"]
        A6["✓ Backup Database"]
        A7["✓ Full System Control"]
    end

    subgraph Backend["🔧 Permission Check"]
        PCheck["@permission_classes<br/>decorator"]
        IsAuth["IsAuthenticated"]
        IsInst["IsInstructor"]
        IsAdmin["IsAdmin"]
        Custom["Custom Permissions"]
    end

    Student --> StudentPerms
    Instructor --> InstructorPerms
    Admin --> AdminPerms

    StudentPerms --> PCheck
    InstructorPerms --> PCheck
    AdminPerms --> PCheck

    PCheck --> IsAuth
    PCheck --> IsInst
    PCheck --> IsAdmin
    PCheck --> Custom

    style Roles fill:#bbdefb
    style StudentPerms fill:#c8e6c9
    style InstructorPerms fill:#fff9c4
    style AdminPerms fill:#ffccbc
    style Backend fill:#f3e5f5
```

---

## 8. MOBILE APP SCREEN HIERARCHY

```mermaid
graph TD
    App["EduLearn App<br/>Root Navigator"]

    App -->|Not Authenticated| AuthStack["🔐 Auth Stack"]
    App -->|Authenticated| MainStack["📱 Main Stack"]

    AuthStack -->|Login Screen| LoginForm["Email & Password<br/>Login Form"]
    AuthStack -->|Register Screen| RegForm["User Registration<br/>Role Selection"]

    MainStack -->|Tab 1: Home| HomeTab["Home Screen<br/>Dashboard<br/>Recent Courses<br/>Upcoming Quizzes"]

    MainStack -->|Tab 2: Courses| CoursesTab["Courses Screen<br/>Course List<br/>Search & Filter"]
    CoursesTab -->|Course Details| CourseDetail["Course Info<br/>Instructor<br/>Enroll Button<br/>Lessons"]

    MainStack -->|Tab 3: Quiz| QuizTab["Quiz Screen<br/>Available Quizzes<br/>Quiz List"]
    QuizTab -->|Attempt Quiz| QuizAttempt["Quiz Interface<br/>Questions<br/>Timer<br/>Submit"]
    QuizAttempt -->|Submit| QuizResult["Results Screen<br/>Score<br/>Right/Wrong<br/>Review"]

    MainStack -->|Tab 4: Profile| ProfileTab["Profile Screen<br/>User Info<br/>Progress Stats<br/>Settings"]
    ProfileTab -->|Progress| ProgressDetail["Learning Progress<br/>Course Breakdown<br/>Charts"]
    ProfileTab -->|Settings| Settings["App Settings<br/>Theme<br/>Logout"]

    style App fill:#e3f2fd
    style AuthStack fill:#ffccbc
    style MainStack fill:#f3e5f5
    style LoginForm fill:#fff9c4
    style RegForm fill:#fff9c4
    style HomeTab fill:#c8e6c9
    style CoursesTab fill:#c8e6c9
    style QuizTab fill:#c8e6c9
    style ProfileTab fill:#c8e6c9
```

---

## 9. DATA PERSISTENCE STRATEGY

```mermaid
graph TB
    subgraph Sources["📦 Data Sources"]
        API["REST API<br/>Backend"]
        LocalDB["Local Database<br/>AsyncStorage"]
    end

    subgraph Storage["💾 Storage Layers"]
        Memory["RAM<br/>React State<br/>Fast Access"]
        Cache["Browser Cache<br/>IndexedDB<br/>Query Cache"]
        Async["AsyncStorage<br/>Persistent<br/>Tokens & Settings"]
    end

    subgraph Operations["🔄 Operations"]
        Read["READ<br/>Fetch from API<br/>Cache in Memory"]
        Write["WRITE<br/>Update API<br/>Update Local"]
        Sync["SYNC<br/>Compare Versions<br/>Resolve Conflicts"]
    end

    subgraph Persistence["💾 Persistence"]
        Token["JWT Tokens<br/>Encrypted Storage<br/>Auto Refresh"]
        User["User Profile<br/>Cached Data"]
        Settings["App Settings<br/>Theme<br/>Preferences"]
    end

    API -->|Fetch| Memory
    LocalDB -->|Load| Cache
    Memory --> Read
    Cache --> Read
    Read -->|Display| Operations
    Write -->|POST/PUT| API
    Write -->|Store| Async
    API -->|Response| Sync
    LocalDB -->|Compare| Sync

    Token -->|Secure| Async
    User -->|Store| Async
    Settings -->|Store| Async

    style Sources fill:#e3f2fd
    style Storage fill:#fff3e0
    style Operations fill:#f3e5f5
    style Persistence fill:#c8e6c9
```

---

## 10. ERROR HANDLING & RECOVERY

```mermaid
graph TD
    Request["Request Sent"]

    Request -->|Network| NetworkErr{Network<br/>Error?}
    NetworkErr -->|Yes| NetRetry["Retry with<br/>Exponential<br/>Backoff"]
    NetRetry -->|Success| Success["✅ Complete"]
    NetRetry -->|Fail| NetFail["Show Error:<br/>Check Connection"]
    NetworkErr -->|No| StatusCheck{"HTTP<br/>Status<br/>Code?"}

    StatusCheck -->|200-299| SuccessCode["Success Response"]
    SuccessCode --> Success

    StatusCheck -->|401| UnAuth["Unauthorized<br/>Token Expired?"]
    UnAuth -->|Yes| Refresh["Refresh Token<br/>Retry Request"]
    Refresh -->|Success| Success
    Refresh -->|Fail| GoLogin["Redirect to<br/>Login Screen"]
    UnAuth -->|No| Invalid["Invalid Credentials<br/>Show Error"]

    StatusCheck -->|403| Forbidden["Forbidden<br/>Insufficient<br/>Permissions"]
    Forbidden --> ShowError["Show Permission<br/>Error Message"]

    StatusCheck -->|404| NotFound["Not Found<br/>Resource Deleted?"]
    NotFound --> ShowError

    StatusCheck -->|5xx| ServerErr["Server Error<br/>Retry Later"]
    ServerErr --> ShowError

    StatusCheck -->|Other| OtherErr["Other Error<br/>Log & Report"]
    OtherErr --> ShowError

    ShowError -->|User Action| Request
    Invalid -->|Clear & Retry| Request
    GoLogin -->|Re-auth| Login["Login Flow"]

    style Success fill:#c8e6c9
    style NetFail fill:#ffccbc
    style ShowError fill:#ffccbc
    style Invalid fill:#ffccbc
    style GoLogin fill:#fff9c4
    style Refresh fill:#e0f2f1
```

---

## 11. SCALABILITY & PERFORMANCE ARCHITECTURE

```mermaid
graph TB
    subgraph Load["📊 Load Distribution"]
        CDN["CDN<br/>Static Assets<br/>Course Media"]
        LB["Load Balancer<br/>Traffic Distribution<br/>SSL Termination"]
    end

    subgraph Servers["🖥️ Application Servers"]
        Server1["Django Server 1"]
        Server2["Django Server 2"]
        Server3["Django Server 3"]
    end

    subgraph Cache["⚡ Caching Layer"]
        Redis["Redis Cache<br/>Session Cache<br/>Query Cache"]
    end

    subgraph DB["💾 Database Layer"]
        Primary["PostgreSQL<br/>Primary Database<br/>Write Operations"]
        Replica["PostgreSQL<br/>Read Replica<br/>Read-Heavy Queries"]
    end

    subgraph Monitoring["📈 Monitoring"]
        Logs["Log Aggregation<br/>Error Tracking"]
        Metrics["Metrics<br/>Performance<br/>Resource Usage"]
    end

    subgraph Backup["🔄 Backup & DR"]
        Backup["Daily Backups<br/>Snapshots"]
        Recovery["Disaster<br/>Recovery Plan"]
    end

    CDN -->|Distribute| LB
    LB -->|Route| Server1
    LB -->|Route| Server2
    LB -->|Route| Server3

    Server1 --> Redis
    Server2 --> Redis
    Server3 --> Redis

    Redis --> Primary
    Server1 -->|Read| Replica
    Server2 -->|Read| Replica
    Server3 -->|Read| Replica

    Server1 --> Logs
    Server2 --> Logs
    Server3 --> Logs

    Server1 --> Metrics
    Primary --> Backup
    Backup --> Recovery

    style Load fill:#bbdefb
    style Servers fill:#fff3e0
    style Cache fill:#e0f2f1
    style DB fill:#e8f5e9
    style Monitoring fill:#f3e5f5
    style Backup fill:#ffccbc
```

---

**Mermaid Diagram Suite Complete**  
_For visual rendering, use a Mermaid viewer or integrate into documentation_
