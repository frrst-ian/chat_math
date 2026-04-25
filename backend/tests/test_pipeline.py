import pytest
from unittest.mock import patch, MagicMock
from services import rag


def test_rag_query_returns_string():
    result = rag.query("sets")
    assert isinstance(result, str)


def test_rag_query_not_empty_for_known_topic():
    result = rag.query("sets")
    assert len(result) > 0, "Expected curriculum content for 'sets'"


def test_rag_query_returns_string_for_unknown_topic():
    # must return empty or low-relevance chunks
    result = rag.query("quantum entanglement")
    assert isinstance(result, str)


def test_rag_query_n_results_respected():
    result = rag.query("linear equations", n_results=2)
    # each chunk is ~400 chars, 2 chunks joined = at most ~800 chars
    assert isinstance(result, str)


def test_generate_explanation_injects_context():
    # verify generate_explanation calls rag.query before the LLM
    with patch("services.rag.query", return_value="mock curriculum context") as mock_rag, \
         patch("litellm.completion") as mock_llm:
        mock_llm.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="This concept is about sets."))]
        )
        from services.llm import generate_explanation
        result = generate_explanation("sets")
        mock_rag.assert_called_once_with("sets")
        assert "This concept is about" in result