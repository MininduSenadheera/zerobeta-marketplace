"use client"
import { useContext, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import config from "@/Helpers/config"
import axios from "axios"
import { AuthContext } from "@/context/AuthContext"

export default function Signin() {
  const { login } = useContext(AuthContext)
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
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

    try {
      const response = await axios.post(config.apiUrl + 'users/login', { ...formData })
      login(response.data.token)
      router.push("/")
    } catch (error) {
      console.error(error)
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError("An error occurred while logging in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="hidden bg-muted md:block md:w-1/2">
        <div className="relative h-full w-full">
          <Image
            src="/images/AuthBg.png"
            alt="Login illustration" fill priority
            className="object-cover"
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-center md:w-1/2">
        <div className="space-y-4 container mx-auto max-w-md px-4 sm:px-0">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-sm">Enter your credentials to access your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email" name="email" type="email" placeholder="Email"
              value={formData.email} onChange={handleChange} required
            />
            <Input
              id="password" name="password" type="password" placeholder="Password"
              value={formData.password} onChange={handleChange} required
            />
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />} Login
            </Button>
          </form>
          <div className="flex justify-center gap-2 mt-4 items-center">
            <p className="text-sm text-gray-600">Don&apos;t have an account?</p>
            <Link href="/signup" className="text-sm">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}