import ShopPage from '../shop/page';

export default function GamesPage() {
  return <ShopPage searchParams={Promise.resolve({ category: 'games' })} />;
}
