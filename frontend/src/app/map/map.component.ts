import { Component, Input, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import { ActivatedRoute } from '@angular/router';
import { CountryService } from '../services/country.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() data : any;
  newData? : any = {
    lat : 0,
    lon : 0,
    zoom : 0
  }
  fullScreen : Boolean = false;
  cName? : String;

  constructor(
    private route : ActivatedRoute,
    private countryService : CountryService
  ) { }

  /*
   * On init, either 
   *  1. fetch the country's map information (fullscreen mode)
   *  2. we already have the map information => set the map
   */
  ngOnInit(): void {
    this.cName = String(this.route.snapshot.paramMap.get("country"));
    if (!this.data) {
      this.countryService.getCountry(
        this.cName, "rest-countries"
      ).subscribe(res => {
        this.fullScreen = true;
        this.newData.lat = res.body!.latlng[0];
        this.newData.lon = res.body!.latlng[1];

        this.countryService.getCountry(this.cName!, "travel-briefing")
          .subscribe(tbRes => {
            if (tbRes.status == 200) {
              this.newData.zoom = res.body!.maps.zoom;
              this.setMap(this.newData);
            }
          });
      });
    }
    else {
      this.setMap(this.data);
    }
  }
  
  /*
   * This function sets up the map
   */
  setMap(data : any) : void {
    // Special case for antarctica => zoom all the way out
    if (this.cName!.toLowerCase() != "antarctica") {
      data.zoom = data.zoom ? data.zoom : 4;
    }

    let map = new Map({
      view: new View({
        center: olProj.fromLonLat([data.lon, data.lat]),
        zoom: this.cName == "Antarctica" ? 0 : 5
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: "map",
    });
    setTimeout(() => {
      map.updateSize();
    }, 0);
  }
}
