import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { AddCategoryDTO, Category, CategoryParams, UpdateCategoryDTO } from "../interfaces/category"
import { PaginationResponse, ResultDTO } from "../interfaces/product.interface"
import { environment } from "../enviroments/enviroment"

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private readonly baseUrl = environment.apiUrl // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getAllCategories(params?: CategoryParams): Observable<PaginationResponse<Category>> {
    let httpParams = new HttpParams()

    if (params) {
      if (params.search) {
        httpParams = httpParams.set("search", params.search)
      }
      if (params.sortProp) {
        httpParams = httpParams.set("sortProp", params.sortProp)
      }
      if (params.sortDirection) {
        httpParams = httpParams.set("sortDirection", params.sortDirection)
      }

      httpParams = httpParams.set("pageIndex", params.pageIndex.toString())
      httpParams = httpParams.set("pageSize", params.pageSize.toString())
    } else {
      httpParams = httpParams.set("pageIndex", "1")
      httpParams = httpParams.set("pageSize", "10")
    }

    return this.http.get<PaginationResponse<Category>>(`${this.baseUrl}/Categories/GetAllCategories`, {
      params: httpParams,
    })
  }

  addCategory(categoryData: AddCategoryDTO): Observable<ResultDTO> {
    const formData = new FormData()

    formData.append("name", categoryData.name)

    if (categoryData.description) {
      formData.append("description", categoryData.description)
    }

    if (categoryData.image) {
      formData.append("image", categoryData.image)
    }

    return this.http.post<ResultDTO>(`${this.baseUrl}/Categories/AddCategory`, formData)
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/Categories/GetCategory/${id}`)
  }

  updateCategory(categoryData: UpdateCategoryDTO): Observable<ResultDTO> {
    const formData = new FormData()

    formData.append("id", categoryData.id.toString())

    if (categoryData.name) {
      formData.append("name", categoryData.name)
    }

    if (categoryData.description) {
      formData.append("description", categoryData.description)
    }

    if (categoryData.image) {
      formData.append("image", categoryData.image)
    }

    return this.http.put<ResultDTO>(`${this.baseUrl}/Categories/UpdateCategory`, formData)
  }

  deleteCategory(id: number): Observable<ResultDTO> {
    return this.http.delete<ResultDTO>(`${this.baseUrl}/Categories/DeleteCategory/${id}`)
  }
}
