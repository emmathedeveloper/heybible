import { LoginForm } from "@/components/login-form"
import { useState } from "react"
import AuthWelcomeView from "./AuthWelcomeView"
import AuthLoadingView from "./AuthLoadingView"
import AuthLicenseInfo from "./AuthLicenseInfoView"
import AuthLicenseVerifiedView from "./AuthLicenseVerifiedView"


const AuthView = () => {

  const [view, setView] = useState('loading')

  const [ license , setLicense ] = useState<any|null>(null)

  const handleSuccess = (data: any) => {
      setLicense(data.license)
      setView('license-info')
  }

  return (
    <div className="size-full flex">

      {
        view == 'loading' && (
          <AuthLoadingView view={view} setView={setView}/>
        )
      }

      {
        view == 'initial' && (
          <AuthWelcomeView view={view} setView={setView}/>
        )
      }

      {
        view == 'license-info' && (
          <AuthLicenseInfo license={license} view={view} setView={setView}/>
        )
      }

      {
        view == 'verified' && (
          <AuthLicenseVerifiedView />
        )
      }

      {
        view == 'login' && (
          <LoginForm onSuccess={handleSuccess}/>
        )
      }


      <div className="flex-1 bg-muted">

      </div>
    </div>
  )
}

export default AuthView