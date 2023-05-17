import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http'
import { catchError, Observable, of, Subject } from 'rxjs';
import { Country } from '../models/country.model';
import { Checklist } from '../models/checklist.model';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  restCountries = "https://restcountries.com/v3.1";
  apiPrefix = "/travelist/api/v1";
  
  countryList : Subject<any> = new Subject<any>();
  checklists : Subject<Checklist[]> = new Subject();

  constructor(
    private http : HttpClient
  ) { }

  setCountries(query : String) : void {
    this.http.get<any>(this.apiPrefix + `/countries?${query}`, { observe: 'response' })
      .subscribe(res => {
        this.countryList.next(res.body);
      });
  }

  setChecklists(uid : String, cName? : String) : void {
    let query = cName == undefined ? "country=none" : `country=${cName}`;
    this.http.get<Checklist[]>(this.apiPrefix + `/${uid}/checklists?${query}`, { observe: 'response'})
      .subscribe(res => {
        if (res.status == 200) {
          this.checklists.next(res.body!);
        }
      });
  }

  setCountryVisited(uid : String, country : Country, visited : Boolean) : Observable<HttpResponse<Country>> {
    console.log(country.name);
    let visitedQuery = visited ? "visited=true" : "visited=false";
    return this.http.put<any>(this.apiPrefix + 
      `/${uid}/countries/${country.name}?${visitedQuery}`, country, { observe : 'response' });
  }

  setTodo(uid : String, checklistId : String, todo : Todo) : Observable<HttpResponse<Todo>> {
    return this.http.put<Todo>(this.apiPrefix +  `/${uid}/checklists/${checklistId}/todos/${todo._id}`, todo, { observe : 'response' })
  }

  getCountries() : Observable<HttpResponse<any>> {

    return this.http.get<any>(this.apiPrefix + `/countries`, { observe : 'response' });
  }

  getCountry(cName : String, data : String) : Observable<HttpResponse<any>> {
    let query = `data=${data}`;
    return this.http.get<any>(this.apiPrefix + `/countries/${cName}?${query}`, { observe: 'response'})
      .pipe(catchError(err => of(err)));
  }

  getUserCountries(uid : String, visited : Boolean) : Observable<HttpResponse<Country[]>> {
    let visitedQuery =  visited ? "visited=true" : "visited=false";
    return this.http.get<Country[]>(this.apiPrefix + `/${uid}/countries?${visitedQuery}`, { observe: 'response' });
  }

  getUserCountry(uid : String, cName : String) : Observable<HttpResponse<Country>> {
    return this.http.get<Country[]>(this.apiPrefix + `/${uid}/countries/${cName}`, { observe: 'response' })
      .pipe(catchError(err => {
        return of(err); 
      }));
  }

  getTodosForChecklist(uid : String, checklistId : String) : Observable<HttpResponse<Todo[]>> {
    return this.http.get<Todo[]>(this.apiPrefix + `/${uid}/checklists/${checklistId}/todos`, { observe : 'response' });
  }

  addChecklist(todo : Checklist, uid : String) : Observable<HttpResponse<Checklist>> {
    return this.http.post<Checklist>(this.apiPrefix + `/${uid}/checklists`, todo, { observe: 'response' });
  }

  addTodoForChecklist(uid : String, checklistId : String, todo : Todo) : Observable<HttpResponse<Todo>> {
    return this.http.post<Todo>(this.apiPrefix + `/${uid}/checklists/${checklistId}/todos`, todo, { observe: 'response'});
  }

  addCountryForUser(uid : String, country : Country) : Observable<HttpResponse<Country>> {
    return this.http.post<Country>(this.apiPrefix + `/${uid}/countries`, country, { observe: 'response'});
  }

  deleteCountryForUser(uid : String, cName : String) : Observable<HttpResponse<any>> {
    return this.http.delete<any>(this.apiPrefix + `/${uid}/countries/${cName}`, { observe: 'response'});
  }

  deleteChecklist(uid : String, checklistId : String) : Observable<HttpResponse<any>> {
    return this.http.delete<any>(this.apiPrefix + `/${uid}/checklists/${checklistId}`,
      {observe : 'response'});
  }
}
