import { NextApiRequest, NextApiResponse } from 'next';
import { server } from '@/http';

interface IncrementViewsRequest extends NextApiRequest {
  body: {
    id: string;
  };
}

interface IncrementViewsResponse {
  success: boolean;
  message?: string;
  error?: any;
}

const incrementViews = async (
  req: IncrementViewsRequest,
  res: NextApiResponse<IncrementViewsResponse>
) => {
  if (req.method === 'POST') {
    const { id } = req.body;

    try {
      const getPage = await server.get(`/blogs/${id}`);
      const pageViews= getPage.data.data.attributes.views
      await server.put(
        `/blogs/${id}`,
        { data: { views: +pageViews+1 } }
      );      

      res.status(200).json({ success: true, message: 'Views incremented successfully' });
    } catch (error) {
      console.error('Error updating views:', error);
      res.status(500).json({ success: false, error });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
};

export default incrementViews;
