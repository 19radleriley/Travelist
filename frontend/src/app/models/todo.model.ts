export class Todo {
    constructor(
        public task : String,
        public completed : Boolean,
        public checklistId : String,
        public userId : String,
        public _id? : String
    ){}
}