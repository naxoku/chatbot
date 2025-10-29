import React from "react";
import { AuthProvider } from "./providers/AuthProvider";
import { ChatDataProvider } from "./providers/ChatDataProvider";
import { UIStateProvider } from "./providers/UIStateProvider";
import { DocumentProvider } from "./providers/DocumentProvider";
import { ChatContainer } from "./containers/ChatContainer";

const ChatInterface = () => {
  return (
    <AuthProvider>
      <DocumentProvider>
        <UIStateProvider>
          <ChatDataProvider>
            <ChatContainer />
          </ChatDataProvider>
        </UIStateProvider>
      </DocumentProvider>
    </AuthProvider>
  );
};

export default ChatInterface;