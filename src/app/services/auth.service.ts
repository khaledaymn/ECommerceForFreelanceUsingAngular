// import { Injectable } from "@angular/core"
// import { HttpClient } from "@angular/common/http"
// import { Observable, of, BehaviorSubject, throwError } from "rxjs"
// import { delay, tap, catchError, map } from "rxjs/operators"
// import { User, UserCredentials, RegistrationData } from "../interfaces/user.interface"
// import { ApiResponse } from "../interfaces/api-response.interface"

// interface LoginResponse {
//   user: User
//   token: string
//   refreshToken: string
// }

// @Injectable({
//   providedIn: "root",
// })
// export class AuthService {
//   private endpoint = "auth"
//   private apiUrl = "https://api.example.com" // Replace with your actual API URL
//   private useMockData = true // Set to false when real API is available
//   private tokenKey = "auth_token"
//   private refreshTokenKey = "refresh_token"
//   private userKey = "current_user"

//   private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage())
//   currentUser$ = this.currentUserSubject.asObservable()

//   private loadingSubject = new BehaviorSubject<boolean>(false)
//   loading$ = this.loadingSubject.asObservable()

//   private errorSubject = new BehaviorSubject<string | null>(null)
//   error$ = this.errorSubject.asObservable()

//   constructor(private http: HttpClient) {}

//   /**
//    * Get the current authenticated user
//    */
//   get currentUser(): User | null {
//     return this.currentUserSubject.value
//   }

//   /**
//    * Check if user is authenticated
//    */
//   get isAuthenticated(): boolean {
//     return !!this.getToken() && !!this.currentUser
//   }

//   /**
//    * Check if user has admin role
//    */
//   get isAdmin(): boolean {
//     return this.currentUser?.role === "admin"
//   }

//   /**
//    * Check if user has manager role
//    */
//   get isManager(): boolean {
//     return this.currentUser?.role === "manager" || this.currentUser?.role === "admin"
//   }

//   /**
//    * Check if user has specific permission
//    */
//   hasPermission(permission: string): boolean {
//     return !!this.currentUser?.permissions?.includes(permission)
//   }

//   /**
//    * Login with email and password
//    */
//   login(credentials: UserCredentials): Observable<LoginResponse> {
//     this.loadingSubject.next(true)
//     this.errorSubject.next(null)

//     if (this.useMockData) {
//       // Mock successful login
//       if (credentials.email === "admin@example.com" && credentials.password === "password") {
//         const response: LoginResponse = {
//           user: {
//             id: "user_1",
//             email: "admin@example.com",
//             role: "admin",
//             initials: "من",
//             lastLogin: new Date(),
//             permissions: ["all"],
//             isActive: true,
//             createdAt: new Date("2023-01-01"),
//             updatedAt: new Date(),
//           },
//           token: "mock-jwt-token",
//           refreshToken: "mock-refresh-token",
//         }

//         return of(response).pipe(
//           delay(800), // Simulate network delay
//           tap((res) => {
//             this.setSession(res)
//             this.loadingSubject.next(false)
//           }),
//           catchError(this.handleError.bind(this)),
//         )
//       }

//       // Mock sales manager login
//       if (credentials.email === "manager@example.com" && credentials.password === "password") {
//         const response: LoginResponse = {
//           user: {
//             id: "user_2",
//             name: "مدير المبيعات",
//             email: "manager@example.com",
//             role: "manager",
//             initials: "مم",
//             lastLogin: new Date(),
//             permissions: ["view_dashboard", "manage_orders", "view_customers", "view_products"],
//             isActive: true,
//             createdAt: new Date("2023-02-15"),
//             updatedAt: new Date(),
//           },
//           token: "mock-jwt-token",
//           refreshToken: "mock-refresh-token",
//         }

//         return of(response).pipe(
//           delay(800),
//           tap((res) => {
//             this.setSession(res)
//             this.loadingSubject.next(false)
//           }),
//           catchError(this.handleError.bind(this)),
//         )
//       }

//       // Mock login failure
//       this.loadingSubject.next(false)
//       return throwError(() => new Error("بريد إلكتروني أو كلمة مرور غير صحيحة"))
//     }

//     return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/${this.endpoint}/login`, credentials).pipe(
//       map((response) => response.data),
//       tap((res) => {
//         this.setSession(res)
//         this.loadingSubject.next(false)
//       }),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Register a new user
//    */
//   register(userData: RegistrationData): Observable<LoginResponse> {
//     this.loadingSubject.next(true)
//     this.errorSubject.next(null)

//     if (this.useMockData) {
//       // Check if email is already taken
//       if (userData.email === "admin@example.com" || userData.email === "manager@example.com") {
//         this.loadingSubject.next(false)
//         return throwError(() => new Error("البريد الإلكتروني مستخدم بالفعل"))
//       }

//       // Mock successful registration
//       const response: LoginResponse = {
//         user: {
//           id: `user_${Math.random().toString(36).substr(2, 9)}`,
//           name: userData.name,
//           email: userData.email,
//           role: "customer",
//           initials: userData.name
//             .split(" ")
//             .map((n) => n[0])
//             .join("")
//             .substr(0, 2),
//           lastLogin: new Date(),
//           permissions: ["view_orders", "view_profile"],
//           phone: userData.phone,
//           company: userData.company,
//           isActive: true,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//         token: "mock-jwt-token",
//         refreshToken: "mock-refresh-token",
//       }

//       return of(response).pipe(
//         delay(1000), // Simulate network delay
//         tap((res) => {
//           this.setSession(res)
//           this.loadingSubject.next(false)
//         }),
//         catchError(this.handleError.bind(this)),
//       )
//     }

//     return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/${this.endpoint}/register`, userData).pipe(
//       map((response) => response.data),
//       tap((res) => {
//         this.setSession(res)
//         this.loadingSubject.next(false)
//       }),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Logout the current user
//    */
//   logout(): Observable<void> {
//     if (this.useMockData) {
//       this.clearSession()
//       return of(undefined).pipe(delay(300)) // Simulate network delay
//     }

//     return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${this.endpoint}/logout`, {}).pipe(
//       map((response) => response.data),
//       tap(() => this.clearSession()),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Refresh the authentication token
//    */
//   refreshToken(): Observable<{ token: string; refreshToken: string }> {
//     const refreshToken = this.getRefreshToken()

//     if (this.useMockData) {
//       if (!refreshToken) {
//         return throwError(() => new Error("لا يوجد رمز تحديث"))
//       }

//       const response = {
//         token: "new-mock-jwt-token",
//         refreshToken: "new-mock-refresh-token",
//       }

//       return of(response).pipe(
//         delay(500), // Simulate network delay
//         tap((res) => {
//           localStorage.setItem(this.tokenKey, res.token)
//           localStorage.setItem(this.refreshTokenKey, res.refreshToken)
//         }),
//         catchError(this.handleError.bind(this)),
//       )
//     }

//     return this.http
//       .post<ApiResponse<{ token: string; refreshToken: string }>>(`${this.apiUrl}/${this.endpoint}/refresh-token`, {
//         refreshToken,
//       })
//       .pipe(
//         map((response) => response.data),
//         tap((res) => {
//           localStorage.setItem(this.tokenKey, res.token)
//           localStorage.setItem(this.refreshTokenKey, res.refreshToken)
//         }),
//         catchError(this.handleError.bind(this)),
//       )
//   }

//   /**
//    * Get the current user's profile
//    */
//   getProfile(): Observable<User> {
//     if (this.useMockData) {
//       const user = this.getUserFromStorage()
//       if (!user) {
//         return throwError(() => new Error("المستخدم غير مسجل الدخول"))
//       }

//       return of(user).pipe(delay(300)) // Simulate network delay
//     }

//     return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${this.endpoint}/profile`).pipe(
//       map((response) => response.data),
//       tap((user) => {
//         this.setUserInStorage(user)
//         this.currentUserSubject.next(user)
//       }),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Update the current user's profile
//    */
//   updateProfile(userData: Partial<User>): Observable<User> {
//     this.loadingSubject.next(true)

//     if (this.useMockData) {
//       const currentUser = this.getUserFromStorage()
//       if (!currentUser) {
//         this.loadingSubject.next(false)
//         return throwError(() => new Error("المستخدم غير مسجل الدخول"))
//       }

//       const updatedUser: User = {
//         ...currentUser,
//         ...userData,
//         // updatedAt: new Date(),
//       }

//       this.setUserInStorage(updatedUser)
//       this.currentUserSubject.next(updatedUser)
//       this.loadingSubject.next(false)

//       return of(updatedUser).pipe(delay(500)) // Simulate network delay
//     }

//     return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${this.endpoint}/profile`, userData).pipe(
//       map((response) => response.data),
//       tap((user) => {
//         this.setUserInStorage(user)
//         this.currentUserSubject.next(user)
//         this.loadingSubject.next(false)
//       }),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Change the current user's password
//    */
//   changePassword(data: {
//     currentPassword: string
//     newPassword: string
//     confirmPassword: string
//   }): Observable<void> {
//     this.loadingSubject.next(true)

//     if (this.useMockData) {
//       // Just simulate success
//       this.loadingSubject.next(false)
//       return of(undefined).pipe(delay(700)) // Simulate network delay
//     }

//     return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${this.endpoint}/change-password`, data).pipe(
//       map((response) => response.data),
//       tap(() => this.loadingSubject.next(false)),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Request password reset
//    */
//   requestPasswordReset(email: string): Observable<void> {
//     this.loadingSubject.next(true)

//     if (this.useMockData) {
//       // Simulate success
//       this.loadingSubject.next(false)
//       return of(undefined).pipe(delay(800)) // Simulate network delay
//     }

//     return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${this.endpoint}/forgot-password`, { email }).pipe(
//       map((response) => response.data),
//       tap(() => this.loadingSubject.next(false)),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Reset password with token
//    */
//   resetPassword(data: { token: string; password: string; passwordConfirmation: string }): Observable<void> {
//     this.loadingSubject.next(true)

//     if (this.useMockData) {
//       // Simulate success
//       this.loadingSubject.next(false)
//       return of(undefined).pipe(delay(800)) // Simulate network delay
//     }

//     return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${this.endpoint}/reset-password`, data).pipe(
//       map((response) => response.data),
//       tap(() => this.loadingSubject.next(false)),
//       catchError(this.handleError.bind(this)),
//     )
//   }

//   /**
//    * Get the authentication token
//    */
//   getToken(): string | null {
//     return localStorage.getItem(this.tokenKey)
//   }

//   /**
//    * Get the refresh token
//    */
//   private getRefreshToken(): string | null {
//     return localStorage.getItem(this.refreshTokenKey)
//   }

//   /**
//    * Set session data after successful authentication
//    */
//   private setSession(authResult: LoginResponse): void {
//     localStorage.setItem(this.tokenKey, authResult.token)
//     localStorage.setItem(this.refreshTokenKey, authResult.refreshToken)
//     this.setUserInStorage(authResult.user)
//     this.currentUserSubject.next(authResult.user)
//   }

//   /**
//    * Clear session data on logout
//    */
//   private clearSession(): void {
//     localStorage.removeItem(this.tokenKey)
//     localStorage.removeItem(this.refreshTokenKey)
//     localStorage.removeItem(this.userKey)
//     this.currentUserSubject.next(null)
//   }

//   /**
//    * Store user data in local storage
//    */
//   private setUserInStorage(user: User): void {
//     localStorage.setItem(this.userKey, JSON.stringify(user))
//   }

//   /**
//    * Get user data from local storage
//    */
//   private getUserFromStorage(): User | null {
//     const userJson = localStorage.getItem(this.userKey)
//     if (!userJson) {
//       return null
//     }

//     try {
//       return JSON.parse(userJson)
//     } catch (e) {
//       console.error("Error parsing user from storage", e)
//       return null
//     }
//   }

//   /**
//    * Error handler
//    */
//   private handleError(error: any) {
//     this.loadingSubject.next(false)
//     let errorMessage = "حدث خطأ في الاتصال بالخادم"

//     if (error.error instanceof ErrorEvent) {
//       // Client-side error
//       errorMessage = `خطأ: ${error.error.message}`
//     } else if (error.error && error.error.message) {
//       // Server-side error with message
//       errorMessage = error.error.message
//     } else if (error.status) {
//       // Server-side error with status
//       switch (error.status) {
//         case 401:
//           errorMessage = "غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى."
//           break
//         case 403:
//           errorMessage = "ليس لديك صلاحية للوصول إلى هذا المورد."
//           break
//         case 404:
//           errorMessage = "المورد المطلوب غير موجود."
//           break
//         case 500:
//           errorMessage = "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا."
//           break
//         default:
//           errorMessage = `حدث خطأ: ${error.statusText}`
//       }
//     } else if (error.message) {
//       // Error with message property
//       errorMessage = error.message
//     }

//     // Set error in subject
//     this.errorSubject.next(errorMessage)

//     // Log the error for debugging
//     console.error("API Error:", error)

//     // Return an observable with a user-facing error message
//     return throwError(() => new Error(errorMessage))
//   }
// }
