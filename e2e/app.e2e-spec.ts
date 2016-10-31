import { RpdSelectPage } from './app.po';

describe('rpd-select App', function() {
  let page: RpdSelectPage;

  beforeEach(() => {
    page = new RpdSelectPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
