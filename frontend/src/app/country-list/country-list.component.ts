import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CountryService } from '../services/country.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.css']
})
export class CountryListComponent implements OnInit {

  p : number = 1;

  filters = [
    "All",
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America"
  ];

  countries? : any;
  
  selectedFilter? : String;
  searchACountry = new FormControl("");

  // Subscription that updates countrylist anytime it is updated in service
  countriesSubscription : Subscription = this.countryService
    .countryList.subscribe(updatedList => {
      this.countries = updatedList;
      this.p = 1;
    });

  constructor(
    private countryService : CountryService,
    private router : Router
  ) { }

  /*
   * On init, set the country list with no filter
   */
  ngOnInit(): void {
    this.selectedFilter = this.filters[0];
    this.setCountryList("");  
  }

  /*
   * Update the country list using the
   * supplied filter.
   */
  setCountryList(filter : String) : void {
    this.countryService.setCountries(filter);
  }

  /*
   * This function selects the tab that is currently
   * being viewed : aka the continent filter
   */
  selectFilter(filter : String) {
    this.selectedFilter = filter;
    this.countries = undefined;
    this.setCountryList(`continent=${filter.toLowerCase()}`)
  }

  /*
   * This function routes the user to a detail view
   * of whichever country they clicked on
   */
  selectCountry(country : any) {
    this.router.navigateByUrl(`/countries/${country.name}`, 
      { state : { country : country }})
  }
}
