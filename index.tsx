import { NativeStackNavigationOptions, createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  NavigationContainer,
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
import { LogBox, } from "react-native";

const navigationPage = "NavigationPage";

export interface NavigatorActions {
  push: <T>(children: ReactNode) => Promise<T | undefined>;
  pop: <T>(result?: T) => void;
  replace: <T>(children: ReactNode) => Promise<T | undefined>;
}

interface NavigatorRouteParams {
  children?: ReactNode;
  completer?: () => void;
}

interface NavigatorProps {
  children: ReactNode;
  options?: NativeStackNavigationOptions;
}

const NavigatorContext = createContext<NavigatorActions | undefined>(undefined);

export const Navigator: FC<NavigatorProps> = ({ children, options }) => {
  const ref = useNavigationContainerRef();

  const push = async <T,>(children: ReactNode): Promise<T | undefined> => {
    return new Promise<T | undefined>((resolve, _) => {
      ref.dispatch(
        StackActions.push(navigationPage, {
          children: children,
          completer: resolve,
        }),
      );
    });
  };

  const replace = async <T,>(children: ReactNode): Promise<T | undefined> => {
    return new Promise<T | undefined>((resolve, _) => {
      ref.dispatch(
        StackActions.replace(navigationPage, {
          children: children,
          completer: resolve,
        }),
      );
    });
  };

  const pop = <T,>(result?: T): void => {
    //@ts-ignore
    ref.getState()?.routes?.at(-1)?.params?.completer(result);
    ref.dispatch(StackActions.pop());
  };

  const Stack = createNativeStackNavigator();
  return (
    <NavigatorContext.Provider value={{ push, replace, pop }}>
      <NavigationContainer independent={true} ref={ref}>
        <Stack.Navigator screenOptions={options} initialRouteName={navigationPage}>
          <Stack.Screen
            name={navigationPage}
            children={({ route }) => {
              const params = route.params as NavigatorRouteParams;
              return (
                <NavigatorPage completer={params?.completer}>
                  {params?.children ?? children}
                </NavigatorPage>
              );
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigatorContext.Provider>
  );
};

const NavigatorPage: FC<NavigatorRouteParams> = ({
  children,
  completer,
}) => {
  useEffect(() => completer, []);
  return <>{children}</>;
};

export function useNavigator(): NavigatorActions | null {
  return useContext(NavigatorContext) ?? null;
}

//warning ignores
const nestedError =
  "Found screens with the same name nested inside one another. Check:";
const nonSerializable =
  "Non-serializable values were found in the navigation state. Check:";
const noParentNavigator = "The 'navigation' object hasn't been initialized yet.";

//may cause errors...
export const hideNavigatorLogs = () => LogBox.ignoreLogs([
  nestedError,
  nonSerializable,
  noParentNavigator
]);

const originalConsoleWarn = console.warn;
console.warn = (...args: (string | string[])[]) => {
  if (typeof args[0] === "string") {
    if (args[0].includes(nestedError) || args[0].includes(nonSerializable)) {
      return;
    }
  }
  originalConsoleWarn.apply(console, args);
};