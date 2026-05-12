import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Round Sys - Software for Children\'s Services',
  description: 'Round Sys Software for Children\'s Services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
