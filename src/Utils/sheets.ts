export async function appendToSheet({ token, values }: {
  token: string;
  values: string[];
}) {
  const spreadsheetId = 'YOUR_SHEET_ID';
  const range = 'Sheet1!A1:E1';

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [values]
      })
    }
  );

  const data = await res.json();
  return data;
}
