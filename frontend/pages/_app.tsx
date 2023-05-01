import type { AppProps } from "next/app";
import "../styles/global.css";
import { initFirebase } from "../firebase/firebaseApp";
import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { UserContextProvider } from "contexts/UserContext";

import Layout from "components/common/Layout";

export default function App({ Component, pageProps }: AppProps) {
  initFirebase();
  const queryClient = new QueryClient();

  return (
    <UserContextProvider>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </UserContextProvider>
  );
}
