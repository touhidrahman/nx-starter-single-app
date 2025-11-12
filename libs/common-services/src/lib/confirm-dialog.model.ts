export type ConfirmDialogData = {
    confirmAction: () => void
    cancelAction?: () => void
    title: string
    message: string
    confirmButtonLabel?: string
    cancelButtonLabel?: string
    event?: Event
}
