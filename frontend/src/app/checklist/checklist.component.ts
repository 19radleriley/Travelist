import { Component, Inject, Input, OnInit } from '@angular/core';
import { Checklist } from '../models/checklist.model';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CountryService } from '../services/country.service';
import { Todo } from '../models/todo.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css']
})
export class ChecklistComponent implements OnInit {

  addingTodo : Boolean = false;
  todos? : Todo[];
  newTodo = new FormControl("");

  constructor(
    private countryService : CountryService,
    private dialog : MatDialogRef<ChecklistComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      checklist : Checklist,
      uid : String,
      country : Boolean
    }
  ) { }

  /*
   * On init, get the list of todos for this checklist
   */
  ngOnInit(): void {
    this.countryService.getTodosForChecklist(
      this.data.uid, this.data.checklist._id
    ).subscribe(res => {
      if (res.status == 200) {
        this.todos = res.body!;
      }
    });
  }

  /*
   * This function closes the dialog
   */
  closeDialog() : void {
    this.dialog.close();
  }

  /*
   * This function deletes the checklist
   * which will percolate down to the todos inside of it
   */
  deleteChecklist() : void {
    if(confirm("Are you sure you want to delete this checklist?")){
      this.countryService.deleteChecklist(this.data.uid, this.data.checklist._id)
        .subscribe(res => {
          if (res.body.deletedCount == 1) {
            this.closeDialog();
            // Delete happened on country detail page
            if (this.data.country) {
              this.countryService.setChecklists(this.data.uid, this.data.checklist.cName);
            }
            // Delete happened on profile
            else {
              this.countryService.setChecklists(this.data.uid);
            }
          }
        })
      }
  }

  /*
   * Add a new todo for this checklist.
   * If the todo text is empty, don't create one 
   */
  addTodo() : void {
    if (this.newTodo.value != "") {
      let todo = new Todo(
        this.newTodo.value,
        false,
        this.data.checklist._id,
        this.data.uid
      )
      this.countryService.addTodoForChecklist(
        this.data.uid, this.data.checklist._id, todo
      ).subscribe(res => {
        if (res.status == 200) {
          this.newTodo.setValue("");
          this.todos!.push(res.body!);
        }
      });
    }
    this.addingTodo = false;
  }

  /*
   * This function updates a todo to be either
   * completed or incomplete
   */
  completeTodo(todo : Todo) {
    this.countryService.setTodo(this.data.uid, this.data.checklist._id, todo)
      .subscribe(res => {
        if (res.status == 200) {
          todo.completed = !todo.completed;
        }
      });
  }
}
