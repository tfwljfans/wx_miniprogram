
import { action, observable } from "mobx-miniprogram"

export const store = observable({
  
  loginState: false,
  
  set_loginState: action(function (value) {
    this.loginState = value
  }),

})