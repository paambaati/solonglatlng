import Document, { Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <html>
        <Head>
        </Head>
        <body >
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

export default MyDocument;
