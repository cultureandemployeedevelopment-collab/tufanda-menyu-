export const metadata = {
  title: 'Panorama Restaurant - Digital Menu',
  description: 'Online Menu',
}

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ 
        fontFamily: 'Inter, sans-serif',
        margin: 0,
        padding: 0,
        background: '#f8f9fa'
      }}>
        {children}
      </body>
    </html>
  )
}
