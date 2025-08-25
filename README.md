# TODO

- !HARD Implement Scrollable Element
- Add support for tsx syntax
- Revamp the API to make it more stable and easy to use while the code is modular and maintainable
- Implement a centralised renderer that will maintain an array of pending draw commands and listen for on draw events, which will continuously check for draw commands in the array, execute them and clear the array
- Implement a way for the UI Tree to be traversed and layout to be recalculated and draw commands to be generated if changes are made.
- Move the Input handling, into it's own separate thing, which will traverse the UI Tree and call the necessary functions or update the necessary signals as needed
- Change style property to be private and only be modified with setter function, which will mark nodes as dirty.
- Implement traversal of the tree, bottom up dfs, during draw call and check for dirty nodes, automatically recalculating the layout if necessary (self or children dimmensions changed)
- Move away from class based architecture to a more functional and object based approach. The UI Tree is made of objects. UI Elements are created by Factory Functions and, separate renderer functions are responsible to take the objects and maintain UI Rendering
- Implement Tailwind class parsing to create style object.