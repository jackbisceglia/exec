import { $signal, component, view } from "solid-yield";

export const App = component(function* App() {
  const [message] = yield* $signal("The workspace is ready.");

  return view(function* () {
    return (
      <main>
        <h1>Exec</h1>
        <p>{yield* message}</p>
      </main>
    );
  });
});
