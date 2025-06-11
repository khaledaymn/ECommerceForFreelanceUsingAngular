// import { Injectable } from "@angular/core"
// import   { HttpClient } from "@angular/common/http"
// import {   Observable, of } from "rxjs"
// // import   { Role, Permission } from "../models/user.model"

// @Injectable({
//   providedIn: "root",
// })
// export class RoleService {
//   private apiUrl = "/api/roles"

//   // Mock data for demo purposes
 
//   constructor(private http: HttpClient) {}

//   getRoles(): Observable<Role[]> {
//     // In a real app, this would be an HTTP request
//     // return this.http.get<Role[]>(this.apiUrl)
//     return of(this.mockRoles)
//   }

//   getRole(id: string): Observable<Role> {
//     // In a real app, this would be an HTTP request
//     // return this.http.get<Role>(`${this.apiUrl}/${id}`)
//     const role = this.mockRoles.find((r) => r.id === id)
//     return of(role as Role)
//   }

//   createRole(role: Omit<Role, "id" | "createdAt" | "updatedAt">): Observable<Role> {
//     // In a real app, this would be an HTTP request
//     // return this.http.post<Role>(this.apiUrl, role)
//     const newRole: Role = {
//       ...role,
//       id: (this.mockRoles.length + 1).toString(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     }
//     this.mockRoles.push(newRole)
//     return of(newRole)
//   }

//   updateRole(id: string, role: Partial<Role>): Observable<Role> {
//     // In a real app, this would be an HTTP request
//     // return this.http.put<Role>(`${this.apiUrl}/${id}`, role)
//     const index = this.mockRoles.findIndex((r) => r.id === id)
//     if (index !== -1) {
//       this.mockRoles[index] = {
//         ...this.mockRoles[index],
//         ...role,
//         updatedAt: new Date(),
//       }
//       return of(this.mockRoles[index])
//     }
//     throw new Error("Role not found")
//   }

//   deleteRole(id: string): Observable<void> {
//     // In a real app, this would be an HTTP request
//     // return this.http.delete<void>(`${this.apiUrl}/${id}`)
//     const index = this.mockRoles.findIndex((r) => r.id === id)
//     if (index !== -1) {
//       this.mockRoles.splice(index, 1)
//     }
//     return of(undefined)
//   }

//   getAllPermissions(): Observable<Permission[]> {
//     // In a real app, this would be an HTTP request
//     // return this.http.get<Permission[]>(`${this.apiUrl}/permissions`)
//     return of(this.mockPermissions)
//   }

//   getPermissionsByModule(): Observable<Record<string, Permission[]>> {
//     return of(this.groupPermissionsByModule(this.mockPermissions))
//   }

//   private groupPermissionsByModule(permissions: Permission[]): Record<string, Permission[]> {
//     return permissions.reduce(
//       (acc, permission) => {
//         if (!acc[permission.module]) {
//           acc[permission.module] = []
//         }
//         acc[permission.module].push(permission)
//         return acc
//       },
//       {} as Record<string, Permission[]>,
//     )
//   }
// }
