import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, StackActions } from "@react-navigation/native";
import React, { ReactNode } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Button, LogBox, View } from "react-native";

const navigationPage = "NavigationPage";

export interface NavigatorActions {
  push: (children: ReactNode) => void;
  pop: () => void;
  replace: (children: ReactNode) => void;
}

interface NavigatorRouteParams {
  view: ReactNode;
}

export const Navigator = ({
  children,
  headerShown,
}: {
  children: ReactNode;
  headerShown?: boolean;
}) => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName={navigationPage}>
        <Stack.Screen
          options={{
            headerShown,
          }}
          name={navigationPage}
          children={({ route }) =>
            (route.params as NavigatorRouteParams)?.view ?? children
          }
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// add callback to end of route or make in async!
export function useNavigator(): NavigatorActions {
  const navigation = useNavigation();

  const push = (children: ReactNode) =>
    navigation.dispatch(StackActions.push(navigationPage, { view: children }));

  const pop = () => navigation.dispatch(StackActions.pop());

  const replace = (children: ReactNode) =>
    navigation.dispatch(
      StackActions.replace(navigationPage, { view: children }),
    );

  return {
    push,
    pop,
    replace,
  };
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

// example
export default function App() {
  return (
    // chain of navigation could be declared statically here outside of compontns,
    // this approach improves navigation safety, straitforward navigation declaration
    <Navigator>
      <First
        onNavigate={(navigator) => {
          navigator.push(
            <Second
              onNavigate={(navigator) => {
                navigator.push(<Third />);
              }}
            />,
          );
        }}
      />
    </Navigator>
  );
}

function First({
  onNavigate,
}: {
  onNavigate: (navigator: NavigatorActions) => void;
}) {
  const navigator = useNavigator();
  return (
    <View style={{ backgroundColor: "red", flex: 1, alignItems: "center" }}>
      <Button
        title="go to second"
        onPress={() => {
          //also could be used without passed callback, but strongly recomended
          //to declare navigation outside of current component
          onNavigate(navigator);
        }}
      ></Button>
    </View>
  );
}

function Second({
  onNavigate,
}: {
  onNavigate: (navigator: NavigatorActions) => void;
}) {
  const navigator = useNavigator();
  return (
    <View style={{ backgroundColor: "blue", flex: 1, alignItems: "center" }}>
      <Button
        title="go to third"
        onPress={() => {
          //also could be used without passed callback, but strongly recomended
          //to declare navigation outside of current component
          onNavigate(navigator);
        }}
      ></Button>
    </View>
  );
}

function Third() {
  return (
    <View
      style={{ backgroundColor: "green", flex: 1, alignItems: "center" }}
    ></View>
  );
}
