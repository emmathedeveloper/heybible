import { Button } from "@/components/ui/button"

type AuthWelcomeViewProps = {
  view: any,
  setView: any
}

const AuthWelcomeView = ({
  setView
}: AuthWelcomeViewProps) => {


  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-5xl font-bold">Hello!</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Click the button and let's get you setup
        </p>
      </div>


      <div className="flex flex-col gap-2 w-full md:w-100">
        <Button onClick={() => setView('login')}>
          Start Activation Process
        </Button>
      </div>
    </div>
  )
}

export default AuthWelcomeView