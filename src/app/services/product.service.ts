import { Injectable } from "@angular/core"
import {   HttpClient, HttpParams } from "@angular/common/http"
import   { Observable } from "rxjs"
import { PaginationResponse, Product, ProductParams } from "../interfaces/product.interface"

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly baseUrl = "https://e-commerce.tryasp.net" // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getAllProducts(params?: ProductParams): Observable<PaginationResponse<Product>> {
    let httpParams = new HttpParams()

    if (params) {
      if (params.search) {
        httpParams = httpParams.set("search", params.search)
      }
      if (params.description) {
        httpParams = httpParams.set("description", params.description)
      }
      if (params.categoryId) {
        httpParams = httpParams.set("categoryId", params.categoryId.toString())
      }
      if (params.brandId) {
        httpParams = httpParams.set("brandId", params.brandId.toString())
      }
      if (params.status) {
        httpParams = httpParams.set("status", params.status)
      }
      if (params.sortProp) {
        httpParams = httpParams.set("sortProp", params.sortProp)
      }
      if (params.sortDirection) {
        httpParams = httpParams.set("sortDirection", params.sortDirection)
      }
      if (params.attributesFilter) {
        Object.keys(params.attributesFilter).forEach((key) => {
          httpParams = httpParams.set(`attributesFilter.${key}`, params.attributesFilter![key])
        })
      }

      httpParams = httpParams.set("pageIndex", params.pageIndex.toString())
      httpParams = httpParams.set("pageSize", params.pageSize.toString())
    } else {
      httpParams = httpParams.set("pageIndex", "1")
      httpParams = httpParams.set("pageSize", "10")
    }

    return this.http.get<PaginationResponse<Product>>(`${this.baseUrl}/Products/GetAllProducts`, {
      params: httpParams,
    })
  }
}
