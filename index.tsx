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
  useLayoutEffect,
  useRef,
} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from "react-native";

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

let navigatorIndex = 0;

export const Navigator: FC<NavigatorProps> = ({ children, headerShown }) => {
  navigatorIndex++;
  const navigatorIndexRef = useRef(navigatorIndex);
  const navigatorRef = useNavigationContainerRef();
  const index = useRef(0);

  useLayoutEffect(() => {
    // window.history.replaceState({ index: index.current }, "");
    const backHandler = (event: PopStateEvent) => {
      const activeNavigator = event.state?.activeNavigator ?? -1;
      if (activeNavigator !== navigatorIndexRef.current) return;
      const newIndex = event.state?.index;
      const forward = newIndex > index.current;
      if (forward) {
        console.log("implement forward, jdk");
        // navigatorRef.current?.dispatch(
        //   StackActions.push(navigationPage, {
        //     view: history.current[newIndex],
        //   }),
        // );
      } else {
        if (navigatorRef.canGoBack()) navigatorRef.goBack();
      }
      index.current = newIndex || 0;
    };
    window.addEventListener("popstate", backHandler);
    return () => {
      window.removeEventListener("popstate", backHandler);
    };
  }, []);

  const push = async <T,>(children: ReactNode): Promise<T | undefined> => {
    const newIndex = index.current + 1;
    window.history.replaceState(
      { index: index.current, activeNavigator: navigatorIndexRef.current },
      "",
      "",
    );
    window.history.pushState(
      { index: newIndex, activeNavigator: navigatorIndexRef.current },
      "",
      "",
    );
    index.current = newIndex;
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
    window.history.replaceState(
      { index: index.current, activeNavigator: navigatorIndexRef.current },
      "",
      "",
    );
    return new Promise<T | undefined>((resolve, _) => {
      navigatorRef.dispatch(
        StackActions.replace(navigationPage, {
          view: children,
          completer: resolve,
        }),
      );
    });
  };

  const pop = () => {
    window.history.back();
    // navigation.goBack();
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
  useEffect(() => {
    return completer;
  }, []);
  return <>{children}</>;
};

export function useNavigator(): NavigatorActions | undefined {
  return useContext(NavigatorContext);
}

//warning ignores
const nestedError =
  "Found screens with the same name nested inside one another. Check:";
const nonSerializable =
  "Non-serializable values were found in the navigation state. Check:";

LogBox.ignoreLogs([nestedError, nonSerializable]);

const originalConsoleWarn = console.warn;
console.warn = (...args: (string | string[])[]) => {
  if (typeof args[0] === "string") {
    if (args[0].includes(nestedError) || args[0].includes(nonSerializable)) {
      return;
    }
  }
  originalConsoleWarn.apply(console, args);
};
