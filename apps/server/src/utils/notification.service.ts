export async function sendNotification(groupId: string, message: string) {
    await fetch(`https://ntfy.sh/${groupId}`, {
        method: 'POST',
        body: message,
    })
}
