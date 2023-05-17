import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.css']
})
export class SynopsisComponent implements OnInit {

  constructor(
    private dialog : MatDialogRef<SynopsisComponent>,
    @Inject(MAT_DIALOG_DATA) public data : {
      synopsis : String
    }
  ) { }

  ngOnInit(): void {
  }
}
