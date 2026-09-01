"""
Visual Entity Link Analysis Engine
Builds node-edge entity graph and correlates graph nodes to 4D spatial map coordinates.
"""

from typing import List, Dict, Any
from .types import GraphNode, GraphEdge

class LinkGraphEngine:
    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        self.edges: List[GraphEdge] = []

    def add_node(self, node: GraphNode):
        self.nodes[node.id] = node

    def add_edge(self, edge: GraphEdge):
        self.edges.append(edge)

    def build_target_graph(self, target_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes entity node graph linked with geospatial map coordinates.
        """
        # Central Target Node
        t_node = GraphNode(
            id=target_id,
            label=profile_data.get("name", "Target Subject"),
            node_type="TARGET_PERSON",
            latitude=28.6139,
            longitude=77.2090
        )
        self.add_node(t_node)

        # Email Node
        if profile_data.get("primary_email"):
            e_node = GraphNode(
                id=f"email_{target_id}",
                label=profile_data["primary_email"],
                node_type="EMAIL"
            )
            self.add_node(e_node)
            self.add_edge(GraphEdge(source_id=target_id, target_id=e_node.id, relationship="HAS_EMAIL"))

        # Primary Location Anchor Node
        loc_node = GraphNode(
            id=f"loc_{target_id}",
            label="Residential Anchor",
            node_type="GEOSPATIAL_ANCHOR",
            latitude=28.6139,
            longitude=77.2090
        )
        self.add_node(loc_node)
        self.add_edge(GraphEdge(source_id=target_id, target_id=loc_node.id, relationship="VISITED_LOCATION"))

        return {
            "nodes": [n.__dict__ for n in self.nodes.values()],
            "edges": [e.__dict__ for e in self.edges]
        }
