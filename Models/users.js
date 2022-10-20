module.exports = class User {
    constructor(id, username, password, email){
        this.id=id;
        this.username = username;
        this.password = password;
        this.email=email;
    }

    static getUsername(){
        return this.username;
    }

    static getPassword(){
        return this.password;
    }

    static getId(){
        return this.id;
    }

    static getEmail(){
        return this.email;
    }

}