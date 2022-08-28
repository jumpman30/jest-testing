const bookservice = require('../src/book.service');
const booksProvider = require('../src/books-provider');
const emailService = require('../src/email.service');
const {expect} = require("expect");
const {calculateDiscountAsync} = require("../src/book.service");

describe('searchBook', () => {

    describe('one book matches search test', () => {
        beforeEach(() => {
            booksProvider.getBooks = jest.fn(() =>
                [
                    {
                        _id: 1,
                        title: 'C# Introduction',
                        publishedDate: '2008-04-01T00:00:00.000-0700'
                    },
                    {
                        _id: 2,
                        title: 'Another Day',
                    }
                ]
            );
            emailService.sendMissingBookEmail = jest.fn(() => console.log('Calling email API...'));
        });
        it('should return 1 book and publish date', () =>{
            const books = bookservice.searchBooks('C');
            expect(books[0]).toMatchObject({
                _id: 1,
                title: 'C# Introduction 2008',
            });
            expect(emailService.sendMissingBookEmail.mock.calls.length).toBe(0);
        });
        it('should return 1 book with no publish date', () => {
            const books = bookservice.searchBooks('Another');
            expect(books[0]).toMatchObject({
                _id: 2,
                title: 'Another Day',
            });
            expect(emailService.sendMissingBookEmail.mock.calls.length).toBe(0);
        })
    });

    describe('no books match the search', () => {
        booksProvider.getBooks = jest.fn(() =>
            [
                {
                    _id: 1,
                    title: 'C# Introduction',
                    publishedDate: '2008-04-01T00:00:00.000-0700'
                },
                {
                    _id: 2,
                    title: 'Another Day',
                }
            ]
        );
        emailService.sendMissingBookEmail = jest.fn(() => console.log('Calling email API...'));
    });
    it('should return 0 books and call email api', () => {
        const books = bookservice.searchBooks('Yep');
        expect(books.length).toBe(0);
        expect(emailService.sendMissingBookEmail.mock.calls.length).toBe(1);

    })
});

describe('get most popular book', () => {
    beforeEach(() => {
        booksProvider.getBooks = jest.fn(() =>
            [
                {
                    _id: 1,
                    title: 'C# Introduction',
                    ordered: 34
                },
                {
                    _id: 2,
                    title: 'Another Day',
                    ordered: 11

                }
            ]
        );
    });
    it('should return the correct most popular book', () => {
        expect(bookservice.getMostPopularBook()).toMatchObject({
            _id: 1,
            title: 'C# Introduction',
            ordered: 34
        })
    })

});

describe('book price with discount', () => {
    beforeEach(() => {
        booksProvider.getBooks = jest.fn(() =>
            [
                {
                    _id: 1,
                    title: 'C# Introduction',
                    ordered: 34,
                    price: 15
                },
                {
                    _id: 2,
                    title: 'Another Day',
                    ordered: 11,
                    price: 35

                }
            ]
        );
    });
    it('should return correct',() => {
        expect(bookservice.calculateDiscount(1)).toBe(12);
    });
    it('should throw error on not found book id', () => {
        expect(() => bookservice.calculateDiscount(34)).toThrowError(Error('Book with such id not found'));
    });
});

describe('async book price with discount', () => {
    beforeEach(() => {
        booksProvider.getBooks = jest.fn(() =>
            [
                {
                    _id: 1,
                    title: 'C# Introduction',
                    ordered: 34,
                    price: 15
                },
                {
                    _id: 2,
                    title: 'Another Day',
                    ordered: 11,
                    price: 35

                }
            ]
        );
    });
    it('should return book with right discount', async () => {
        const price = await calculateDiscountAsync(1);

        expect(price).toBe(12);
    });
    it('should throw Error for book not found', async () => {
        expect(async () => calculateDiscountAsync(4)).rejects.toThrowError(Error('Book with such id not found'));
    })
})