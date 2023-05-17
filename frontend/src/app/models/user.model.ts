export class User {
    constructor(
        public username : String,
        public email : String,
        public _id : String,
        public admin : Boolean,
        public active : Boolean,
        public password? : String
    ){}
}