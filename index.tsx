import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  StackActions,
  useNavigationContainerRef,
} from "@react-navigation/native";
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox, Platform } from "react-native";

const navigationPage = "NavigationPage";

export interface NavigatorActions {
  push: <T>(children: ReactNode) => Promise<T | undefined>;
  pop: <T>(result?: T) => void;
  replace: <T>(children: ReactNode) => Promise<T | undefined>;
}

interface NavigatorRouteParams {
  view?: ReactNode;
  completer?: () => void;
}

interface NavigatorProps {
  children: ReactNode;
  headerShown?: boolean;
}

const NavigatorContext = createContext<NavigatorActions | undefined>(undefined);

export const Navigator: FC<NavigatorProps> = ({ children, headerShown }) => {
  const navigatorRef = useNavigationContainerRef();
  const parentNavigator = useNavigator();

  const push = async <T,>(children: ReactNode): Promise<T | undefined> => {
    return new Promise<T | undefined>((resolve, _) => {
      navigatorRef.dispatch(
        StackActions.push(navigationPage, {
          view: children,
          completer: resolve,
        }),
      );
    });
  };

  const replace = async <T,>(children: ReactNode): Promise<T | undefined> => {
    return new Promise<T | undefined>((resolve, _) => {
      navigatorRef.dispatch(
        StackActions.replace(navigationPage, {
          view: children,
          completer: resolve,
        }),
      );
    });
  };

  const pop = <T,>(result?: T): void => {
    if (!navigatorRef.canGoBack()) {
      if (parentNavigator == null)
        throw Error("cant go back, because no navigator above");
      parentNavigator.pop(result);
      return;
    }
    // @ts-ignore
    navigatorRef.getState().routes.at(-1).params.completer(result);
    navigatorRef.dispatch(StackActions.pop());
  };

  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer ref={navigatorRef} independent={true}>
      <NavigatorContext.Provider
        value={{
          push,
          replace,
          pop,
        }}
      >
        <Stack.Navigator initialRouteName={navigationPage}>
          <Stack.Screen
            options={{
              headerShown,
              
            }}
            name={navigationPage}
            children={({ route }) => {
              const params = route.params as NavigatorRouteParams;
              return (
                <NavigatorPage completer={params?.completer}>
                  {params?.view ?? children}
                </NavigatorPage>
              );
            }}
          />
        </Stack.Navigator>
      </NavigatorContext.Provider>
    </NavigationContainer>
  );
};

const NavigatorPage = ({
  children,
  completer,
}: {
  children: ReactNode;
  completer?: () => void;
}) => {
  useEffect(() => completer, []);
  return <>{children}</>;
};

export function useNavigator(): NavigatorActions | null {
  try {
    return useContext(NavigatorContext)!;
  } catch {
    return null;
  }
}

//warning ignores
const nestedError =
  "Found screens with the same name nested inside one another. Check:";
const nonSerializable =
  "Non-serializable values were found in the navigation state. Check:";

//may cause errors...
// LogBox.ignoreLogs([nestedError, nonSerializable]);

const originalConsoleWarn = console.warn;
console.warn = (...args: (string | string[])[]) => {
  if (typeof args[0] === "string") {
    if (args[0].includes(nestedError) || args[0].includes(nonSerializable)) {
      return;
    }
  }
  originalConsoleWarn.apply(console, args);
};
