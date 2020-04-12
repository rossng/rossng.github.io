---
layout: post
date: 2020-04-11 16:43:00 +0100
title: >
  My favourite bugs: mesh cutting
categories: ''
excerpt_separator: <!--more-->
---

I thought it would be fun to write about a few weird or well-hidden bugs that I've encountered over the years. Here's the first in a (potential) series.

This is a bug I caught in an algorithm for cutting a [triangle mesh](https://en.wikipedia.org/wiki/Triangle_mesh) by a [polyline](https://en.wikipedia.org/wiki/Polygonal_chain). Let's clarify each of those terms. A triangle mesh is a surface defined by a series of triangles connected at their edges or vertices. A polyline is essentially an ordered sequence of points in 3D space.

![The mesh cutting algorithm](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-example-01.svg)

The basic idea of the algorithm was that each point along the polyline could be mapped to a vertex on the mesh. This could then be turned into a contiguous path of edges along the mesh, completely bisecting it. For a closed mesh, this would have to be a circular path. Then it would be possible to find all facets on one side of the path by simply flood-filling neighbouring facets.

## A working case

Here's an example of the algorithm in its working state.

![An example tri mesh and a polyline to cut it](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-working-01.svg)

We start with the mesh and the polyline (red) that we want to use for cutting. We need to convert this into a path that actually sits on the mesh, so let's map each polyline vertex to the nearest mesh vertex.

![Mapping the polyline to the nearest vertices](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-working-02.svg)

This image shows those nearest vertices as red dots. One thing you might observe is that neighbouring *polyline* vertices do not necessarily result in neighbouring *mesh* vertices. In order to generate a contiguous path on the mesh we will have to find a path between **a** and **b**, for example.

It's pretty easy to find a reasonable path (green) by using (e.g.) Dijkstra's algorithm. 

![Filling in the gaps of the path on the mesh](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-working-03.svg)

Now we have a path that sits exactly on the mesh and subdivides it. The next step is to pick a single facet, perhaps on a specific side of the path.

![Choosing a facet on one side of the subdivision path](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-working-04.svg)

Finally, we can flood fill from this facet. Our flooding condition is that we must not cross the subdivision path (green).

![Result of flood-filling the facets on one side of the path](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-working-05.svg)

Now that we've found the facets on one side of the path, we can e.g. keep them and discard the rest.

![Result of flood-filling the facets on one side of the path](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-working-06.svg)

## What went wrong?

In some cases, the algorithm wouldn't cut the mesh as expected. The flood fill would somehow flood every facet on the mesh, causing the entire mesh to be retained during the cutting process.

Why did this happen? Well, let's consider a slightly different cutting polyline.

![The same mesh with a slightly different cutting polyline](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-failing-01.svg)

In this case, we end up selecting slightly different initial vertices on the mesh.

![The closest mesh vertices to the new polyline vertices](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-failing-02.svg)

Then something interesting happens. When we find the shortest path between **a** and **b** and then between **b** and **c**, they turn out to both go through the same point. We have a (short!) loop in our cutting path.

![The shortest path connecting the vertices - now with a loop](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-failing-03.svg)

All seems fine for now though. Let's start the flood filling.

![Beginning the flood filling with the new subdivision path](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-failing-04.svg)

![The incorrect result of cutting](/assets/2020-04-12-my-favourite-bugs-mesh-cutting/mesh-cutting-failing-05.svg)

Uh oh! Something has gone badly wrong.

It turns out that the code for deciding whether to flood fill a facet looked something like this.

```
procedure can_flood_fill(facet, neighbour_facet, cutting_path) returns bool
  (v1, v2) ← shared_vertices(facet, neighbour_facet)
  
  i1 ← index_of(cutting_path, v1)
  i2 ← index_of(cutting_path, v2)

  // Can only flood fill if the vertices are not neighbours along the cutting path.
  return abs(i1 - i2) ≠ 1
```

Can you see the problem? This code implicitly assumes that the cutting path contains no loops. If the same vertex appears more than once, it will only compare to the index where that vertex *first* appeared in the list. So it's possible to find cases where the condition reports that the vertices are not neighbours in the path, but they actually are.