import ShopPage from '../shop/page';

export default function PreOwnedPage() {
  return <ShopPage searchParams={Promise.resolve({ condition: 'MINT_PREOWNED' })} />;
}
