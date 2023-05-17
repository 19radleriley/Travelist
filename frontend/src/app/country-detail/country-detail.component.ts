import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Country } from '../models/country.model';
import { Checklist } from '../models/checklist.model';
import { User } from '../models/user.model';
import { CountryService } from '../services/country.service';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ChecklistComponent } from '../checklist/checklist.component';
import { Subscription } from 'rxjs';
import { SynopsisComponent } from '../synopsis/synopsis.component';

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.css']
})
export class CountryDetailComponent implements OnInit {
  saved : Boolean = false;
  visited : Boolean = false;
  creatingTodo : boolean = false;
  selectedTab? : String;
  tabs : String[] = [
    "General",
    "Travel",
    "Links",
  ]
  wikiLinks? : any[];
  wikiSummary? : String;
  tbCountry? : any;
  restCountry? : any;
  userCountry? : Country;

  user? : User;
  checklists? : Checklist[];

  mapReady : Boolean = false;
  mapData? : any = {
    lat : 0,
    lon : 0,
    zoom : 0
  };

  checklistsSubscription : Subscription = this.countryService
    .checklists.subscribe(updatedList => {
      this.checklists = updatedList;
    })

  todoTitle = new FormControl("");
  todoDesc = new FormControl("");

  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private countryService : CountryService,
    private userService : UserService,
    private checklistDialog : MatDialog,
    private synopsisDialog : MatDialog
  ) { }

  /*
   * On init, determine if there is a logged in user.
   * Proceed from there
   */
  ngOnInit(): void {
    this.selectedTab = this.tabs[0];
    this.userService.whoami().subscribe(res => {
      // Set the component's user
      if (res.status == 200) {
        this.user = res.body!;
      }
      // Initialize the country
      this.initCountry();
    });
  }

  /*
   * This function updates the selected tab
   * of information
   */
  changeTab(tab : String) : void {
    this.selectedTab = tab;
  }

  /*
   * This function toggles a country to either be saved 
   * for a user or to be removed. Note, removals are soft
   * deletes in the system. If the user is not logged in,
   * then the save button will route them to the log in page.
   */
  toggleSave() : void {
    if (this.user) {
      // Go save this country to the user
      if (!this.saved) {
        let countryToAdd = new Country(
          this.user!._id,
          this.restCountry.name.common,
          this.restCountry.flags.png,
          false,
        );
        this.countryService.addCountryForUser(this.user!._id, countryToAdd)
          .subscribe(res => {
            if (res.status == 200) {
              this.userCountry = res.body!;
              this.saved = !this.saved;
              if (this.tabs.length != 4) {
                this.tabs.push("Todos");
              }
            }
        });
      }
      // Remove this country from the user
      else {
        if (confirm("Are you sure you want to un-add this country?")) {
          this.countryService.deleteCountryForUser(this.user!._id, this.restCountry.name.common)
            .subscribe(res => {
              if (res.body.deletedCount == 1) {
                this.saved = !this.saved;
                this.tabs.pop();
              }
            });
        }
      }
    }
    else {
      this.router.navigate(["/login"]);
    }
  }

  /*
   * This function directs the traffic for setting up 
   * the country information
   */
  initCountry() : void {
    let cName = String(this.route.snapshot.paramMap.get("country"));

    this.restCountries(cName);
    this.wikiData(cName);
  }

  /*
   * This function sets up the data that is retrieved
   * from the rest countries api. 
   */
  restCountries(cName : String) : void {
    this.countryService.getCountry(
      cName, "rest-countries"
    ).subscribe(res => {
      this.restCountry = res.body!;
      if (this.restCountry.currencies) {
        this.restCountry.currency = this.restCountry.currencies[Object.keys(this.restCountry.currencies)[0]].name;
      }

      // Init the travelBriefing info
      this.travelBriefing(cName);
      this.mapData!.lat = this.restCountry.latlng[0];
      this.mapData!.lon = this.restCountry.latlng[1];

      // Only look to see if user exists
      if (this.user != undefined) {
        this.countryService.getUserCountry(this.user!._id, this.restCountry.name.common)
          .subscribe(res => {
            if (res.status == 404) {
              this.saved = false;
            }
            else {
              this.userCountry = res.body!;
              this.tabs.push("Todos")
              this.saved = true;
              this.visited = this.userCountry.visited;
              this.initChecklists();
            }
          });
      }
    });
  }

  /*
   * This function sets up the data that is fetched
   * from the wikipedia api
   */
  wikiData(cName : String) : void {
    this.countryService.getCountry(
      cName, "wiki-links")
      .subscribe(res => {
        if (res.status == 200) {
          this.wikiLinks = res.body!;
        }
      });
      this.countryService.getCountry(
        cName, "wiki-summary"
      ).subscribe(res => {
        if (res.status == 200) {
          this.wikiSummary = res.body!;
        }
      });
  }

  /*
   * This function sets up the data that is fetched 
   * from the travel briefing api
   */
  travelBriefing(cName : String) : void {
    this.countryService.getCountry(
      cName, "travel-briefing"
    ).subscribe(res => {
      if (res.status == 200) {
        this.tbCountry = res.body!;
        this.tbCountry.weather = this.convertToF(this.tbCountry.weather);
        this.mapData!.zoom = this.tbCountry.maps.zoom;
      }
      this.mapReady = true;
    });
  }
 
  /*
   * This function inits the checklists (if any)
   * that the user has created for this country
   */
  initChecklists() {
    this.countryService.setChecklists(this.user!._id, this.restCountry.name.common);
  }
 
  /*
   * This function toggles the creation of a new checklist
   */
  toggleCreation() : void {
    this.todoTitle.setValue("");
    this.todoDesc.setValue("");
    this.creatingTodo = !this.creatingTodo;
  }

  /*
   * This function adds a new checklist to the 
   * country for this user
   */
  addChecklist() : void {
    let todo = new Checklist(
      this.todoTitle.value,
      this.todoDesc.value,
      "",
      this.restCountry.flags.png,
      this.restCountry.name.common,
    );
    this.countryService.addChecklist(todo, this.user!._id)
      .subscribe(res => {
      if (res.status == 200) {
        this.todoTitle.setValue("");
        this.todoDesc.setValue("");
        this.creatingTodo = false;
        this.countryService.setChecklists(this.user!._id, this.userCountry!.name);
      } 
      else {
        alert("Failed to add todo!");
      }
    });
  }

  /*
   * This function opens a dialog to view a checklist
   * in more detail and see the todos associated with it
   */
  viewChecklist(currentChecklist : Checklist) : void {
    this.checklistDialog.open(ChecklistComponent, {
      data : { checklist : currentChecklist, uid : this.user!._id, country : true }
    });
  }

  /*
   * This function assigns this country to 'visited' status
   */
  setVisited() : void {
    this.countryService.setCountryVisited(this.user!._id, this.userCountry!, !this.visited)
      .subscribe(res => {
        if (res.status == 200) {
          this.userCountry = res.body!;
          this.visited = !this.visited;
        }
      });
  }

  /*
   * This function converts the average temperatures by month
   * from celcius into fahrenheit
   */
  convertToF(weather : any) : any {
    let months = ["January", "February", "March", "April",
                  "May", "June", "July", "August", "September",
                  "October", "November", "December"];
    let cToF = months.map(month => {
      return { name: month, tAvg : Math.round((weather[month].tAvg * 1.8) + 32) };
    });
    return cToF;
  }

  /*
   * This function opens a dialog to view 
   * the full synopsis of this country that was 
   * retrieved from wikipedia
   */
  viewSynopsis(synopsis : String) : void {
    this.synopsisDialog.open(SynopsisComponent, {
      data : { synopsis : synopsis}
    });
  }
}
