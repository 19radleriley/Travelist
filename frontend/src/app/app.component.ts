import { Component } from '@angular/core';
import { User } from './models/user.model';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'Travelist';

  constructor(
    private userService : UserService
  ){}

  ngOnInit(): void {
      // this.userService.whoami().subscribe(res => {
      //   if (res.status == 200) {
      //     console.log("Yes user on session");
      //     this.userService.notifyAboutChange(res.body!);
      //   }
      //   else {
      //     console.log("No user on session");
      //   }
      // });
  }
}
