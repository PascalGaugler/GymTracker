import { useRef, useState } from "react"
import { format } from "date-fns"
import { Download, Upload } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { BackupSchema, exportBackupJson, importBackup, type Backup } from "@/data/backup"

import { SettingsSection } from "./SettingsSection"

interface PendingImport {
  backup: Backup
  fileName: string
}

// Export/import is the only backup path (local-first, no backend). Import
// replaces everything, so the file is parsed and Zod-validated first and the
// user confirms against a summary of what the file actually contains.
export function BackupSection() {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<PendingImport | null>(null)

  async function handleExport() {
    setBusy(true)
    try {
      const json = await exportBackupJson()
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }))
      const link = document.createElement("a")
      link.href = url
      link.download = `gym-tracker-backup-${format(new Date(), "yyyy-MM-dd")}.json`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success(t("settings.backup.exported"))
    } catch {
      toast.error(t("settings.backup.exportError"))
    } finally {
      setBusy(false)
    }
  }

  async function handleFile(file: File) {
    setPending(null)
    let data: unknown
    try {
      data = JSON.parse(await file.text())
    } catch {
      toast.error(t("settings.backup.notJson"))
      return
    }
    const result = BackupSchema.safeParse(data)
    if (!result.success) {
      toast.error(t("settings.backup.invalid"))
      return
    }
    setPending({ backup: result.data, fileName: file.name })
  }

  async function handleImport() {
    if (!pending) return
    setBusy(true)
    try {
      await importBackup(pending.backup)
      setPending(null)
      toast.success(t("settings.backup.imported"))
    } catch {
      toast.error(t("settings.backup.importError"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <SettingsSection title={t("settings.backup.title")} body={t("settings.backup.body")}>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="h-12 w-full"
          disabled={busy}
          onClick={() => void handleExport()}
        >
          <Download className="size-4" />
          {t("settings.backup.export")}
        </Button>

        <Button
          variant="outline"
          className="h-12 w-full"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-4" />
          {t("settings.backup.choose")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = "" // so re-picking the same file fires onChange again
            if (file) void handleFile(file)
          }}
        />
      </div>

      {pending && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-caption font-medium wrap-break-word text-destructive">
            {t("settings.backup.confirm", { file: pending.fileName })}
          </p>
          <p className="mt-1 font-mono text-caption text-muted-foreground">
            {t("settings.backup.summary", {
              exercises: pending.backup.exercises.length,
              sessions: pending.backup.sessions.length,
              measurements: pending.backup.measurements.length,
            })}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="destructive"
              className="h-11 sm:flex-1"
              disabled={busy}
              onClick={() => void handleImport()}
            >
              {t("settings.backup.replace")}
            </Button>
            <Button
              variant="ghost"
              className="h-11 sm:flex-1"
              disabled={busy}
              onClick={() => setPending(null)}
            >
              {t("settings.backup.cancel")}
            </Button>
          </div>
        </div>
      )}
    </SettingsSection>
  )
}
