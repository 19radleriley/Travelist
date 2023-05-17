import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, of, Subject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiPrefix = "/travelist/api/v1";
  user : Subject<User> = new Subject<User>();
  nonAdmins : Subject<User[]> = new Subject<User[]>();

  constructor(
    private http : HttpClient
  ) { }

  register(email : String, password : String) : Observable<HttpResponse<User>> {
    let u = { "email" : email, "password" : password };

    return this.http.post<any>(this.apiPrefix + `/register`, u, { observe : "response" })
      .pipe(catchError(err => {
        return of(err);
      })); 
  }

  login(email : String, password : String) : Observable<HttpResponse<User>> {
    let u = { "email" : email, "password" : password };

    return this.http.post<any>(this.apiPrefix + `/login`, u, { observe : "response" })
      .pipe(catchError(err => {
        return of(err);
      }));
  }

  updateMyself(uid : String, user : User) : Observable<HttpResponse<User>> {
    return this.http.put<User>(this.apiPrefix + `/users/${uid}`, user, { observe : 'response' })
      .pipe(catchError(err => of(err)));
  }

  updateUser(aid : String, user : User) : Observable<HttpResponse<User>> {
    console.log("Updating user");
    return this.http.put<User>(this.apiPrefix + `/admins/${aid}/users/${user._id}`, user, { observe : 'response'})
      .pipe(catchError(err => of(err)));
  }

  setUsers(aid : String) : void {
    this.http.get<User[]>(this.apiPrefix + `/admins/${aid}/users`, { observe : "response" })
      .subscribe(res => {
        if (res.status == 200) {
          this.nonAdmins.next(res.body!);
        }
      });
  }

  createUser(aid : String, user : User) : Observable<HttpResponse<User>> {
    return this.http.post<User>(this.apiPrefix + `/admins/${aid}/users`, user, { observe : 'response'})
      .pipe(catchError(err => of(err)));
  }

  deleteUser(aid : String, uid : String) : Observable<HttpResponse<User>> {
    return this.http.delete<User>(this.apiPrefix + `/admins/${aid}/users/${uid}`, { observe : 'response' });
  }

  logout() : Observable<HttpResponse<any>> {
    return this.http.post<any>(this.apiPrefix + `/logout`, {}, { observe : "response" });
  }

  whoami() : Observable<HttpResponse<User>> {
    return this.http.get<User>(this.apiPrefix + `/whoami`, { observe : 'response' });
  }

  notifyAboutChange(u? : User) : void {
    this.user.next(u!);
  }
}