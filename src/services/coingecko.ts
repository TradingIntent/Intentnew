export async function getSolanaPrice(): Promise<number | null> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    if (data.solana && data.solana.usd) {
      return data.solana.usd;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Solana price:", error);
    return null;
  }
} 