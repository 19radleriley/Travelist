import { Country } from "./country.model";
import { Todo } from "./todo.model";

export class Checklist {
    constructor(
        public title : String,
        public description : String,
        public _id : String,
        public flagLink : String,
        public cName : String,
    ){}
}