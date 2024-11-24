const cds = require('@sap/cds');
const { Books } = cds.entities('sap.capire.bookshop');

class CatalogService extends cds.ApplicationService {
  init() {

    // Hook into the 'READ' event for 'ListOfBooks' and apply filtering based on the country from the request headers
    // this.before('READ', 'ListOfBooks', async req => {
    //   // Retrieve the country from the custom request header 'x-user-country'
    //   const userCountry = req.headers['x-user-country'] || 'IN'; // Fallback to 'IN' (India) if not found
      
    //   // Log for debugging
    //   console.log(`User Country from Cookie: ${userCountry}`);

    //   // Apply filtering based on the user's country
    //   if (userCountry) {
    //     req.query.where({ country: userCountry });
    //   }
    this.before('READ', 'ListOfBooks', async req => {
      const userCountry = req.user.country || req.cookies.country; // Access cookie
      if (userCountry) {
        req.query.where({ country: userCountry });
      }
    });

    // Reduce stock of ordered books if available stock suffices
    this.on('submitOrder', async req => {
      const { book, quantity } = req.data;
      let { stock } = await SELECT `stock`.from(Books, book);
      if (stock >= quantity) {
        await UPDATE(Books, book).with(`stock -=`, quantity);
        await this.emit('OrderedBook', { book, quantity, buyer: req.user.id });
        return { stock };
      } else {
        return req.error(409, `${quantity} exceeds stock for book #${book}`);
      }
    });

    // Add some discount for overstocked books
    this.after('READ', 'ListOfBooks', each => {
      if (each.stock > 111) each.title += ` -- 11% discount!`;
    });

    return super.init();
  }
}

module.exports = { CatalogService };
