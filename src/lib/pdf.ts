import { reportsApi } from '../api/endpoints'

export async function downloadReportPdf(reportId: number): Promise<string> {
  const { blob, fileName } = await reportsApi.pdf(reportId)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return fileName
}

// The tab is opened right away (inside the click) so the browser does not block it,
// and gets the PDF once it arrives.
export async function previewReportPdf(reportId: number): Promise<void> {
  const tab = window.open('', '_blank')
  try {
    const { blob } = await reportsApi.pdf(reportId)
    const url = URL.createObjectURL(blob)
    if (tab) tab.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    tab?.close()
    throw error
  }
}
