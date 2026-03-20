import { useEffect } from "react"

const AuthLicenseVerifiedView = () => {

  useEffect(() => {

    setTimeout(() => {
        window.ipcRenderer.send('goto-app')
    } , 5000)
  } , [])

  return (
    <div className='size-full flex flex-1 flex-col  justify-center items-center gap-4'>
        <h1 className="text-3xl">License verified</h1>

        <p>Getting you started in a few seconds, please wait....</p>
    </div>
  )
}

export default AuthLicenseVerifiedView