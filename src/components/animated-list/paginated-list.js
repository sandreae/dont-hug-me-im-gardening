export class PaginatedList extends HTMLElement {
  constructor() {
    super();

    this.query = null;
    this.currentPage = [];
    this.hasNextPage = false;
    this.hasPreviousPage = false;
  }

  setQuery(query) {
    this.query = query;
  }

  setPageSize(pageSize) {
    this.pageSize = pageSize;
  }

  async nextPage() {
    let options = {
      first: this.pageSize,
      after: this.currentPage[this.pageSize - 1]
        ? this.currentPage[this.pageSize - 1]['cursor']
        : null,
    };

    if (this.search) {
      options.filter = `{ name: { contains: "${this.search}" } }`;
    }

    const { documents, hasNextPage } = await this.query(options);

    this.hasNextPage = hasNextPage;
    this.hasPreviousPage = this.currentPage.length > 0;
    this.currentPage = documents;
    return this.currentPage;
  }

  async previousPage() {
    let options = {
      first: this.pageSize,
      after: this.currentPage[0]['cursor'],
      orderDirection: 'DESC',
    };

    if (this.search) {
      options.filter = `{ name: { contains: "${this.search}" } }`;
    }

    const { documents, hasNextPage } = await this.query(options);
    this.hasPreviousPage = hasNextPage;
    this.hasNextPage = true;
    this.currentPage = Array.from(documents).reverse();
    return this.currentPage;
  }

  get hasPreviousPage() {
    return this.getAttribute('has-previous-page');
  }

  set hasPreviousPage(val) {
    if (val) {
      this.setAttribute('has-previous-page', val);
    } else {
      this.removeAttribute('has-previous-page');
    }
  }

  get hasNextPage() {
    return this.getAttribute('has-next-page');
  }

  set hasNextPage(val) {
    if (val) {
      this.setAttribute('has-next-page', val);
    } else {
      this.removeAttribute('has-next-page');
    }
  }
}
