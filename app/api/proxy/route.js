import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'https://script.google.com/macros/s/AKfycby5I_jtxV3iiKJ34jBSq78EHxBGC_mwJu4_omneY0cMV3oKr6nvsbHnf4Nf0M9-sZV4lQ/exec'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams(searchParams)

  try {
    const response = await fetch(`${API_URL}?${upstreamParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
