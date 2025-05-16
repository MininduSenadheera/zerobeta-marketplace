"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    userRole: "Buyer",
    firstname: "",
    lastname: "",
    email: "",
    country: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordHint, setShowPasswordHint] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      //TODO: Replace with actual API call
      router.push("/signin")
    } catch (error) {
      console.error(error)
      setError("An error occurred while creating your account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="hidden bg-muted md:block md:w-1/2">
        <div className="relative h-full w-full">
          <Image
            src="/images/login-background.jpg"
            alt="Login illustration" fill priority
            className="object-cover"
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-center md:w-1/2">
        <div className="space-y-4 py-4 container mx-auto max-w-md px-4 sm:px-0">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-sm">Enter your details to create a new account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="Buyer" onValueChange={(value) => setFormData({ ...formData, userRole: value })}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Buyer">Buyer</TabsTrigger>
                <TabsTrigger value="Seller">Seller</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid gid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="firstname" name="firstname" type="text" placeholder="First Name"
                value={formData.firstname} onChange={handleChange} required
              />
              <Input
                id="lastname" name="lastname" type="text" placeholder="Last Name"
                value={formData.lastname} onChange={handleChange} required
              />
            </div>
            <Input
              id="email" name="email" type="email" placeholder="Email"
              value={formData.email} onChange={handleChange} required
            />
            {formData.userRole === "Seller" && (
              <Input
                id="country" name="country" type="text" placeholder="Country"
                value={formData.country} onChange={handleChange} required
              />
            )}
            <div>
              <Input
                id="password" name="password" type="password" placeholder="Password"
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
                value={formData.password} onChange={handleChange} required
                className="mb-2" onFocus={() => setShowPasswordHint(true)} onBlur={() => setShowPasswordHint(false)}
              />
              {showPasswordHint && (
                <p className="text-sm text-muted-foreground">
                  Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.
                </p>
              )}
            </div>
            <Input
              id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
              value={formData.confirmPassword} onChange={handleChange} required
            />
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />} Register
            </Button>
          </form>
          <div className="flex justify-center gap-2 mt-4 items-center">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <Link href="/signin" className="text-sm">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

