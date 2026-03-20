import { Button } from "@/components/ui/button"
import { useState } from "react"

type AuthLicenseInfoViewProps = {
  view: any,
  setView: any,
  license: any
}

const AuthLicenseInfoView = ({ license , setView } : AuthLicenseInfoViewProps) => {

  const [ activating , setActivating ] = useState(false)

  const handleActivate = async () => {
      try {
        setActivating(true)

        await window.ipcRenderer.invoke('save-license-key' , license.license)

        setActivating(false)

        setView('loading')

      } catch (error) {
        setActivating(false)
      }
  }

  return (
    <div className='size-full flex flex-col gap-4 items-center justify-center'>
      <p>This is the license for</p>

      <h1 className="text-3xl font-black">{license.name}</h1>

      <Button disabled={activating} onClick={handleActivate} className="w-full md:w-100">
        Activate
      </Button>
    </div>
  )
}

export default AuthLicenseInfoView