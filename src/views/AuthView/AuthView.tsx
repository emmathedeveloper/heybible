import { LoginForm } from "@/components/login-form"
import { useState } from "react"
import AuthWelcomeView from "./AuthWelcomeView"
import AuthLoadingView from "./AuthLoadingView"


const AuthView = () => {

  const [view, setView] = useState('loading')

  return (
    <div className="size-full flex">

      {
        view == 'loading' && (
          <AuthLoadingView />
        )
      }

      {
        view == 'initial' && (
          <AuthWelcomeView view={view} setView={setView}/>
        )
      }

      {
        view == 'login' && (
          <LoginForm />
        )
      }


      <div className="flex-1 bg-muted">

      </div>
    </div>
  )
}

export default AuthView